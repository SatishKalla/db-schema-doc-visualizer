import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { chatModel } from "../utils/ai-models";
import agentGraph from "../utils/agent-graph";
import logger from "../utils/logger";
import { getDbConnection } from "../utils/db-connection";
import { supabase } from "../clients/supabase-client";
import {
  INSIGHTS_SYSTEM_PROMPT,
  prepareInsightsUserPrompt,
} from "../utils/prompts";

async function checkAIConnection() {
  try {
    logger.info("checkAIConnection: starting AI connection check");
    const response = await chatModel.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("Explain how AI works in a few words."),
    ]);
    logger.info("checkAIConnection: received response from AI");
    return response.content;
  } catch (error) {
    logger.error(`checkAIConnection: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function getDatabaseSchema(databaseName: string) {
  try {
    logger.info(`getDatabaseSchema: databaseName: ${databaseName} `);
    const db = getDbConnection(databaseName);

    let tables = [];
    let ddl = [];

    if (db.client.config.client === "mysql2") {
      const [rows] = await db.raw(`SHOW TABLES from ${databaseName}`);
      const tableKey = Object.keys(rows[0])[0];
      tables = rows.map((r: any) => r[tableKey]);

      for (const t of tables) {
        const [createRes] = await db.raw(
          `SHOW CREATE TABLE ${databaseName}.${t}`
        );
        ddl.push(createRes[0]["Create Table"] + ";");
      }
    } else if (db.client.config.client === "pg") {
      const result = await db.raw(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
      tables = result.rows.map((row: any) => row.table_name);

      for (const t of tables) {
        const createRes = await db.raw(`
        WITH cols AS (
          SELECT 
            a.attname AS column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
            CASE WHEN a.attnotnull THEN 'NOT NULL' ELSE 'NULL' END AS nullable,
            coalesce(pg_get_expr(ad.adbin, ad.adrelid), '') AS default_value
          FROM pg_attribute a
          JOIN pg_class c ON a.attrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
          WHERE c.relname = '${t}' AND n.nspname = 'public' AND a.attnum > 0
          ORDER BY a.attnum
        ),
        pkeys AS (
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = '${t}' AND tc.constraint_type = 'PRIMARY KEY'
          ORDER BY kcu.ordinal_position
        ),
        fkeys AS (
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table,
            ccu.column_name AS foreign_column
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.table_name = '${t}' AND tc.constraint_type = 'FOREIGN KEY'
        )
        SELECT 
          'CREATE TABLE ' || '${t}' || ' (\n' ||
          string_agg(
            '  ' || column_name || ' ' || data_type || ' ' || nullable || 
            CASE WHEN default_value <> '' THEN ' DEFAULT ' || default_value ELSE '' END
            , ',\n'
          ) ||
          COALESCE(
            (SELECT ',\n  PRIMARY KEY(' || string_agg(column_name, ', ') || ')' FROM pkeys)
          , '') ||
          COALESCE(
            (SELECT string_agg(',\n  FOREIGN KEY(' || column_name || ') REFERENCES ' || foreign_table || '(' || foreign_column || ')', '')
            FROM fkeys)
          , '') ||
          '\n);' AS create_table_sql
        FROM cols;
      `);

        ddl.push(createRes.rows[0].create_table_sql);
      }
    } else {
      return null;
    }

    return ddl.join("\n\n");
  } catch (error) {
    logger.error(`getDatabaseSchema: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function generateInsights(
  databaseId: string,
  databaseName: string,
  userId: string
) {
  const startTime = Date.now();

  try {
    logger.info(
      `generateInsights: starting: ${JSON.stringify({
        databaseId,
        databaseName,
        userId,
      })}`
    );

    // Get database schema
    const dbSchema = await getDatabaseSchema(databaseName);
    if (!dbSchema) {
      throw new Error("Failed to retrieve database schema");
    }

    // Generate insights using LLM
    const response = await chatModel.invoke([
      new SystemMessage(INSIGHTS_SYSTEM_PROMPT),
      new HumanMessage(prepareInsightsUserPrompt(dbSchema)),
    ]);

    if (!response.content) throw new Error("No response from Model");

    let insights;

    if (typeof response.content === "string") {
      insights = response.content;
    } else if (Array.isArray(response.content)) {
      insights = response.content
        .map((c: any) => (typeof c === "string" ? c : c.text || ""))
        .join("\n");
    } else if (
      typeof response.content === "object" &&
      "text" in response.content
    ) {
      insights = (response.content as any).text;
    } else {
      throw new Error("Unexpected response.content type");
    }

    const cleaned = insights.replace(/^```json\s*|```\s*$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: extract JSON object from the string
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        logger.error("generateInsights: parse error, attempting fallback", {
          cleaned,
        });
        throw new Error("Failed to parse JSON from response:\n" + cleaned);
      }
    }

    // Save insights to database
    const { data, error } = await supabase
      .from("insights")
      .upsert(
        {
          database_id: databaseId,
          user_id: userId,
          insights_data: parsed,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "database_id,user_id",
        }
      )
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // Get current insights generation count
    const { data: currentDb, error: fetchDbError } = await supabase
      .from("databases")
      .select("insights_gen_count")
      .eq("id", databaseId)
      .single();

    if (fetchDbError) {
      logger.error(
        `generateInsights: failed to fetch current database data: ${JSON.stringify(
          fetchDbError
        )}`
      );
    }

    const currentCount = currentDb?.insights_gen_count || 0;

    // Calculate total generation time
    const endTime = Date.now();
    const generationDuration = endTime - startTime; // Duration in milliseconds

    // Update insights generation metadata in databases table
    const { data: dbData, error: dbError } = await supabase
      .from("databases")
      .update({
        insights_gen_count: currentCount + 1, // Increment generation count
        insights_gen_time: generationDuration, // Store duration as string
        user_id: userId,
      })
      .eq("id", databaseId)
      .select("*")
      .single();

    if (dbError) {
      logger.error(
        `generateInsights: failed to update database metadata: ${JSON.stringify(
          dbError
        )}`
      );
      throw new Error(dbError.message);
    }

    logger.info(`generateInsights: completed for database ${databaseName}`);
    return data;
  } catch (error) {
    logger.error(`generateInsights: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function viewInsights(databaseId: string, userId: string) {
  try {
    logger.info(
      `viewInsights: starting: ${JSON.stringify({ databaseId, userId })}`
    );

    const { data, error } = await supabase
      .from("insights")
      .select("*")
      .eq("database_id", databaseId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No insights found
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    logger.error(`viewInsights: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function runAgentFlow(question: string, database: string) {
  try {
    logger.info("runAgentFlow: starting", { question, database });
    const state: any = { input: question, database: database };

    const response = await agentGraph.invoke(state);
    logger.info("runAgentFlow: agent flow completed");
    return response;
  } catch (error) {
    logger.error("runAgentFlow: error", { error, question, database });
    throw error;
  }
}

export { checkAIConnection, generateInsights, viewInsights, runAgentFlow };

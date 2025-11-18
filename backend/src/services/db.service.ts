import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { chatModel } from "../utils/ai-models";
import {
  DbConfig,
  getDbConnection,
  initializeDb,
} from "../utils/db-connection";
import {
  ER_DOCS_SYSTEM_PROMPT,
  prepareERDocsUserPrompt,
} from "../utils/prompts";
import { createRetriever } from "../utils/retriever";
import logger from "../utils/logger";

async function listDatabases(config: DbConfig) {
  try {
    logger.info("listDatabases: start", { client: config.client });
    const { client, connection } = config;

    if (client === "pg") {
      connection.database = "postgres";
    }

    const db = initializeDb({ client, connection, pool: { min: 0, max: 5 } });

    if (client === "pg") {
      const result = await db.raw("SELECT datname FROM pg_database");
      const databases = result.rows.map((row: any) => row.datname);
      return databases;
    } else if (client === "mysql2") {
      const result = await db.raw("SHOW DATABASES");
      const databases = result[0].map((row: any) => row.Database);
      return databases;
    }

    return new Error("Unsupported database client");
  } catch (err) {
    logger.error("listDatabases: error", { err });
    throw err;
  }
}

async function getDatabaseSchema(database: string) {
  try {
    logger.info("getDatabaseSchema: start", { database });
    const db = getDbConnection(database);

    let tables = [];
    let ddl = [];

    if (db.client.config.client === "mysql2") {
      const [rows] = await db.raw(`SHOW TABLES from ${database}`);
      const tableKey = Object.keys(rows[0])[0];
      tables = rows.map((r: any) => r[tableKey]);

      for (const t of tables) {
        const [createRes] = await db.raw(`SHOW CREATE TABLE ${database}.${t}`);
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
    logger.error("getDatabaseSchema: error", { database, error });
    throw error;
  }
}

async function generateDiagramAndDocs(database: string) {
  logger.info("generateDiagramAndDocs: start", { database });
  const dbSchema = await getDatabaseSchema(database);

  if (!dbSchema) {
    throw new Error("Failed to retrieve database schema");
  }

  const response = await chatModel.invoke([
    new SystemMessage(ER_DOCS_SYSTEM_PROMPT),
    new HumanMessage(prepareERDocsUserPrompt(dbSchema)),
  ]);

  // let text =
  //   '```json\n{\n  "title": "Simple Blog Database Schema",\n  "mermaid": "erDiagram\\n    users {\\n        SERIAL id PK\\n        VARCHAR username\\n        VARCHAR email\\n    }\\n    posts {\\n        SERIAL id PK\\n        INT user_id FK\\n        VARCHAR title\\n    }\\n    users ||--o{ posts : has",\n  "documentation": "This database schema represents a simple blog application with two tables: `users` and `posts`.\\n\\n### Tables\\n\\n#### `users`\\nRepresents individual users of the blog.\\n- **`id`**: `SERIAL` (Primary Key)\\n  - A unique identifier for each user. Automatically incremented.\\n- **`username`**: `VARCHAR(50)`\\n  - The chosen username for the user. Maximum 50 characters.\\n- **`email`**: `VARCHAR(100)`\\n  - The email address of the user. Maximum 100 characters.\\n\\n#### `posts`\\nRepresents blog posts created by users.\\n- **`id`**: `SERIAL` (Primary Key)\\n  - A unique identifier for each post. Automatically incremented.\\n- **`user_id`**: `INT` (Foreign Key referencing `users.id`)\\n  - The ID of the user who created the post.\\n- **`title`**: `VARCHAR(200)`\\n  - The title of the blog post. Maximum 200 characters.\\n\\n### Relationships\\n- Each user can have multiple posts.\\n- Each post is associated with one user via `user_id`.\\n\\n### Example Query\\n```sql\\nSELECT users.username, posts.title FROM users JOIN posts ON users.id = posts.user_id;\\n```"\n}\n```';

  let text: string;
  if (!response.content) throw new Error("No response from Model");

  if (typeof response.content === "string") {
    text = response.content;
  } else if (Array.isArray(response.content)) {
    text = response.content
      .map((c: any) => (typeof c === "string" ? c : c.text || ""))
      .join("\n");
  } else if (
    typeof response.content === "object" &&
    "text" in response.content
  ) {
    text = (response.content as any).text;
  } else {
    throw new Error("Unexpected response.content type");
  }

  // Remove possible code block markers and trim whitespace
  const cleaned = text.replace(/^```json\s*|```\s*$/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: extract JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      logger.error("generateDiagramAndDocs: parse error, attempting fallback", {
        cleaned,
      });
      throw new Error("Failed to parse JSON from response:\n" + cleaned);
    }
  }
  await createRetriever(parsed.erDiagram, parsed.documentation);
  logger.info("generateDiagramAndDocs: completed", { title: parsed?.title });
  return parsed;
}

export { listDatabases, getDatabaseSchema, generateDiagramAndDocs };

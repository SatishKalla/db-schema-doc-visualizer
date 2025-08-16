import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { chatModel } from "../utils/ai-models";
import {
  DbConfig,
  getDbConnection,
  initializeDb,
} from "../utils/db-connection";

async function checkAIConnectionApi() {
  try {
    const response = await chatModel.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("Explain how AI works in a few words."),
    ]);
    return response.content;
  } catch (err) {
    throw err;
  }
}

async function listDatabases(config: DbConfig) {
  try {
    const { client, connection } = config;

    if (client === "pg") {
      connection.database = "postgres";
    }

    const db = initializeDb({ client, connection });

    const result = await db.raw("SHOW DATABASES");

    return result;
  } catch (err) {
    throw err;
  }
}

async function getDatabaseSchema(database: string) {
  try {
    const db = getDbConnection();

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
      const result = await db("pg_tables")
        .select("tablename")
        .where("schemaname", "public");
      tables = result.map((r) => r.tablename);

      for (const t of tables) {
        const createRes = await db.raw(
          `SELECT pg_get_tabledef('${t}'::regclass) AS ddl;`
        );
        ddl.push(createRes.rows[0].ddl + ";");
      }
    } else {
      return null;
    }

    return ddl.join(" ");
  } catch (error) {
    throw error;
  }
}

async function generateDiagramAndDocs(database: string) {
  const dbSchema = await getDatabaseSchema(database);

  if (!dbSchema) {
    throw new Error("Failed to retrieve database schema");
  }

  // carefully craft the prompt to get consistent JSON output
  const systemPrompt = `You are an assistant that converts database schemas or descriptions into a mermaid ER diagram and clear documentation. Output ONLY a JSON object with three fields: title, mermaid, documentation. The mermaid field must contain a \"erDiagram\" (mermaid ER) or a \"classDiagram\" suitable for visualizing tables and relations. The documentation should be markdown giving table descriptions, columns, types, PK/FK, and example queries.`;

  const userPrompt = `Schema or description:\n\n${dbSchema}\n\nReturn the JSON object only. No explanatory text.`;

  const response = await chatModel.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
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
      throw new Error("Failed to parse JSON from response:\n" + cleaned);
    }
  }

  return parsed;
}

export {
  checkAIConnectionApi,
  listDatabases,
  getDatabaseSchema,
  generateDiagramAndDocs,
};

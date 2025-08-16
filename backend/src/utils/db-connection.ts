import knex, { Knex } from "knex";

export interface DbConfig {
  client: string;
  connection: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
}

let db: Knex | null = null;

export function initializeDb(config: DbConfig) {
  db = knex({
    client: config.client,
    connection: config.connection,
  });
  return db;
}

export function getDbConnection(): Knex {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDb() first.");
  }
  return db;
}

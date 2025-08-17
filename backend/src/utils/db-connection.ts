import knex, { Knex } from "knex";

export interface DbConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database?: string;
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
    throw new Error(
      "Database connection expired. Please connect to the database."
    );
  }
  return db;
}

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
  pool: { min: number; max: number };
}

let db: Knex | null = null;

export function initializeDb(config: DbConfig) {
  db = knex({
    client: config.client,
    connection: { ...config.connection, ssl: { rejectUnauthorized: false } },
    pool: { min: 0, max: 5 },
  });
  return db;
}

export function getDbConnection(database: string): Knex {
  if (!db) {
    throw new Error(
      "Database connection expired. Please connect to the database."
    );
  }

  if (db.client.config.client === "pg" && database) {
    return knex({
      client: "pg",
      connection: {
        host: db.client.config.connection.host,
        user: db.client.config.connection.user,
        password: db.client.config.connection.password,
        database: database,
        ssl: { rejectUnauthorized: false },
      },
      pool: { min: 0, max: 5 },
    });
  }
  return db;
}

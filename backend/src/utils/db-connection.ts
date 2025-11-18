import knex, { Knex } from "knex";
import logger from "./logger";

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
  logger.info("initializeDb: creating DB connection", {
    client: config.client,
  });
  db = knex({
    client: config.client,
    connection: { ...config.connection, ssl: { rejectUnauthorized: false } },
    pool: { min: 0, max: 5 },
  });
  return db;
}

export function getDbConnection(database: string): Knex {
  if (!db) {
    logger.error("getDbConnection: no global DB connection");
    throw new Error(
      "Database connection expired. Please connect to the database."
    );
  }

  if (db.client.config.client === "pg" && database) {
    logger.info("getDbConnection: creating pg connection for database", {
      database,
    });
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

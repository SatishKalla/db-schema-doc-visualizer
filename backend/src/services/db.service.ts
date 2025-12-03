import { DbConfig, initializeDb } from "../utils/db-connection";
import logger from "../utils/logger";
import { supabase } from "../clients/supabase-client";
import { encryptPassword, decryptPassword } from "../utils/encryption";

async function connectToDatabase(databaseName: string, connectionId: string) {
  try {
    logger.info(
      `connectToDatabase: ${JSON.stringify({ databaseName, connectionId })}`
    );

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error) throw new Error(error.message);

    const { name, db_type, host, port, db_user, db_password } = data;

    const db = initializeDb({
      client: db_type,
      connection: {
        name,
        host,
        port,
        user: db_user,
        password: decryptPassword(db_password),
        database: databaseName,
      },
      pool: { min: 0, max: 5 },
    });

    return db;
  } catch (error) {
    logger.error(`connectToDatabase: error: ${JSON.stringify({ error })}`);
    throw error;
  }
}

async function createConnection(userId: string, config: DbConfig) {
  try {
    logger.info(`createConnection: ${JSON.stringify({ userId, config })}`);
    const { client, connection } = config;
    const { name, host, port, user, password } = connection;
    const encryptedPassword = encryptPassword(password);
    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          name,
          db_type: client,
          host,
          port,
          db_user: user,
          db_password: encryptedPassword,
          user_id: userId,
        },
      ])
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`createConnection: error: ${JSON.stringify({ error })}`);
    throw error;
  }
}

async function getConnection(connectionId: string) {
  try {
    logger.info(`getConnection: connectionId: ${connectionId}`);
    const { data, error } = await supabase
      .from("connections")
      .select("id")
      .eq("id", connectionId)
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`getConnection: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function updateConnection(
  connectionId: string,
  userId: string,
  config: DbConfig
) {
  try {
    logger.info(
      `updateConnection: payload: ${JSON.stringify({
        connectionId,
        userId,
        config,
      })}`
    );
    const connectionData = await getConnection(connectionId);
    if (!connectionData) {
      throw new Error(
        `Connection details not found for connection id: ${connectionId}`
      );
    }
    const { connection } = config;
    const { name, database, host, port, user, password } = connection;
    const encryptedPassword = encryptPassword(password);
    const { data, error } = await supabase
      .from("connections")
      .update([
        {
          name,
          db_type: database,
          host,
          port,
          db_user: user,
          db_password: encryptedPassword,
          user_id: userId,
        },
      ])
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`updateConnection: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function listConnections(userId: string) {
  try {
    logger.info(`listConnections: userId: ${userId}`);
    const { data, error } = await supabase
      .from("connections")
      .select(
        `
        id,
        name,
        db_type,
        host,
        port,
        db_user,
        db_password,
        recent_database_id,
        last_connected_at,
        created_at,
        user_id,
        databases:databases!recent_database_id (
          id,
          name
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`listConnections: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function deleteConnection(connectionId: string, userId: string) {
  try {
    logger.info(
      `deleteConnection: payload: ${JSON.stringify({ connectionId, userId })}`
    );
    const connectionData = await getConnection(connectionId);
    if (!connectionData) {
      throw new Error(
        `Connection details not found for connection id: ${connectionId}`
      );
    }

    const databases = await listDatabasesForConnection(connectionId, userId);

    if (databases && databases.length > 0) {
      const databaseList = databases.map((d) => d.id);
      for (const databaseId of databaseList) {
        await supabase.rpc("drop_vectors_table", {
          tbl: `vectors_${databaseId}`,
        });
      }
    }

    const { data, error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId)
      .select("*");

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`deleteConnection: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function listDatabases(userId: string, config: DbConfig) {
  try {
    logger.info(
      `listDatabases: payload: ${JSON.stringify({
        userId,
        client: config.client,
      })}`
    );
    const { client, connection, restrictConnection } = config;

    if (client !== "pg" && client !== "mysql2") {
      throw new Error("Unsupported database client");
    }

    if (client === "pg") {
      connection.database = "postgres";
    }

    let connections = null;
    let databases = [];
    try {
      const db = initializeDb({
        client,
        connection:
          restrictConnection === "false"
            ? connection
            : {
                ...connection,
                password: decryptPassword(connection.password),
              },
        pool: { min: 0, max: 5 },
      });
      if (client === "pg") {
        const result = await db.raw("SELECT datname FROM pg_database");
        databases = result.rows.map((row: any) => row.datname);
      } else if (client === "mysql2") {
        const result = await db.raw("SHOW DATABASES");
        databases = result[0].map((row: any) => row.Database);
      }
    } catch (error) {
      throw new Error(
        "Database connection failed. Please connect to the database with valid credentials."
      );
    }

    if (databases.length > 0 && restrictConnection === "false") {
      connections = await createConnection(userId, config);
    }

    return { connections, databases };
  } catch (error) {
    logger.error(`listDatabases: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function createDatabase(
  connectionId: string,
  name: string,
  userId: string
) {
  try {
    logger.info(
      `createDatabase: payload: ${JSON.stringify({
        connectionId,
        name,
        userId,
      })}`
    );
    const { data, error } = await supabase
      .from("databases")
      .insert([
        {
          connection_id: connectionId,
          name,
          user_id: userId,
          insights_status: "Pending",
        },
      ])
      .select(
        `
        id,
        name,
        insights_status,
        insights_gen_count,
        insights_gen_time,
        connections:connections!connection_id (
          id,
          name
        )
      `
      )
      .single();

    if (error) throw new Error(error.message);

    const { data: connData, error: dbError } = await supabase
      .from("connections")
      .update({
        recent_database_id: data.id,
        last_connected_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq("id", connectionId)
      .select("*")
      .single();

    if (dbError) {
      logger.error(
        `createDatabase: failed to create database: ${JSON.stringify(dbError)}`
      );
      throw new Error(dbError.message);
    }

    return data;
  } catch (error) {
    logger.error(`createDatabase: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function listSelectedDatabases(userId: string) {
  try {
    logger.info(`listSelectedDatabases: userId: ${userId}`);
    const { data, error } = await supabase
      .from("databases")
      .select(
        `
        id,
        name,
        insights_status,
        insights_gen_count,
        insights_gen_time,
        connections:connections!connection_id (
          id,
          name
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`listSelectedDatabases: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function deleteDatabase(databaseId: string) {
  try {
    logger.info(`deleteDatabase: databaseId: ${databaseId}`);

    const { data, error } = await supabase
      .from("databases")
      .delete()
      .eq("id", databaseId)
      .select(
        `
        id,
        name,
        insights_status,
        insights_gen_count,
        insights_gen_time,
        connections:connections!connection_id (
          id,
          name
        )
      `
      );

    if (error) throw new Error(error.message);

    await supabase.rpc("drop_vectors_table", { tbl: `vectors_${databaseId}` });

    return data;
  } catch (error) {
    logger.error(`deleteDatabase: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function listDatabasesForConnection(
  connectionId: string,
  userId: string
) {
  try {
    logger.info(
      `listDatabasesForConnection: connectionId: ${connectionId}, userId: ${userId}`
    );
    const { data, error } = await supabase
      .from("databases")
      .select(
        `
        id,
        name,
        insights_status,
        insights_gen_count,
        insights_gen_time,
        connections:connections!connection_id (
          id,
          name
        )
      `
      )
      .eq("connection_id", connectionId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    logger.error(`listDatabasesForConnection: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

export {
  connectToDatabase,
  createConnection,
  updateConnection,
  listConnections,
  deleteConnection,
  listDatabases,
  createDatabase,
  listSelectedDatabases,
  deleteDatabase,
  listDatabasesForConnection,
};

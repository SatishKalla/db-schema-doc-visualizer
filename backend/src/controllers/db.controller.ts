import { Request, Response } from "express";
import {
  listDatabases,
  createConnection,
  updateConnection,
  listConnections,
  deleteConnection,
  createDatabase,
  listSelectedDatabases,
  deleteDatabase,
  listDatabasesForConnection,
} from "../services/db.service";
import errorHandler from "../middlewares/error-handler";

async function createConnectionController(req: Request, res: Response) {
  const { body, user } = req;
  if (!body || !body.connection)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await createConnection(user.id, body);
    res.json({ message: "Connection created successfully!", response: result });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function updateConnectionController(req: Request, res: Response) {
  const { body, user } = req;
  const { connectionId } = req.params;
  if (!connectionId)
    return res.status(400).json({ error: "Connection ID required" });
  if (!body || !body.connection)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await updateConnection(connectionId, user.id, body);
    res.json({ message: "Connection updated successfully!", response: result });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function listConnectionController(req: Request, res: Response) {
  const { user } = req;
  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await listConnections(user.id);
    res.json({
      message: "Connections retrieved successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function deleteConnectionController(req: Request, res: Response) {
  const { user } = req;
  const { connectionId } = req.params;
  if (!connectionId)
    return res.status(400).json({ error: "Connection ID required" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await deleteConnection(connectionId, user.id);
    res.json({
      message: "Connection deleted successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function listDatabasesController(req: Request, res: Response) {
  const { body, user } = req;
  if (!body || !body.client || !body.connection)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await listDatabases(user.id, body);
    res.json({
      message: "Databases retrieved successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function createDatabaseController(req: Request, res: Response) {
  const { body, user } = req;
  if (!body || !body.connectionId || !body.name)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await createDatabase(body.connectionId, body.name, user.id);
    res.json({ message: "Database created successfully!", response: result });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function listSelectedDatabaseController(req: Request, res: Response) {
  const { user } = req;

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await listSelectedDatabases(user.id);
    res.json({
      message: "Databases retrieved successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function deleteDatabaseController(req: Request, res: Response) {
  const { databaseId } = req.params;
  const { user } = req;
  if (!databaseId)
    return res.status(400).json({ error: "Database ID required" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await deleteDatabase(databaseId);
    res.json({
      message: "Database deleted successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function listDatabasesForConnectionController(
  req: Request,
  res: Response
) {
  const { connectionId } = req.params;
  const { user } = req;
  if (!connectionId)
    return res.status(400).json({ error: "Connection ID required" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await listDatabasesForConnection(connectionId, user.id);
    res.json({
      message: "Databases retrieved successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export {
  createConnectionController,
  updateConnectionController,
  listConnectionController,
  deleteConnectionController,
  listDatabasesController,
  createDatabaseController,
  listSelectedDatabaseController,
  deleteDatabaseController,
  listDatabasesForConnectionController,
};

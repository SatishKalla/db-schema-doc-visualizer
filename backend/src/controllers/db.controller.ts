import { Request, Response } from "express";
import { listDatabases, generateDiagramAndDocs } from "../services/db.service";
import errorHandler from "../middlewares/error-handler";

export async function listDatabasesController(req: Request, res: Response) {
  const body = req.body;
  if (!body || !body.client || !body.connection)
    return res.status(400).json({ error: "Invalid request body" });

  try {
    const result = await listDatabases(body);
    res.json({ message: "Databases retrieved successfully!", data: result });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export async function generateSchemaDocController(req: Request, res: Response) {
  const { database } = req.params;
  if (!database) return res.status(400).json({ error: "Invalid request body" });

  try {
    const parsed = await generateDiagramAndDocs(database);
    res.json({
      message: "Schema documentation generated successfully!",
      data: parsed,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export default { listDatabasesController, generateSchemaDocController };

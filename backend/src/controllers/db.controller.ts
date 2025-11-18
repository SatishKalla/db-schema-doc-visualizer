import { Request, Response } from "express";
import { listDatabases, generateDiagramAndDocs } from "../services/db.service";

export async function listDatabasesController(req: Request, res: Response) {
  const body = req.body;
  if (!body || !body.client || !body.connection)
    throw new Error("Invalid request body");

  const result = await listDatabases(body);
  res.json({ message: "Databases retrieved successfully!", data: result });
}

export async function generateSchemaDocController(req: Request, res: Response) {
  const { database } = req.params;
  if (!database) throw new Error("Invalid request params");

  const parsed = await generateDiagramAndDocs(database);
  res.json({
    message: "Schema documentation generated successfully!",
    data: parsed,
  });
}

export default { listDatabasesController, generateSchemaDocController };

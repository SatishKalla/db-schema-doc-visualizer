import { Request, Response } from "express";
import { checkAIConnection, runAgentFlow } from "../services/agent.service";

export async function checkAIConnectionController(
  _req: Request,
  res: Response
) {
  const response = await checkAIConnection();
  res.json(response);
}

export async function askAgentController(req: Request, res: Response) {
  const { question, database } = req.body;
  if (!question || !database) throw new Error("Invalid request body");

  const result = await runAgentFlow(question, database);
  res.json({ message: "Agent flow executed successfully!", data: result });
}

export default { askAgentController };

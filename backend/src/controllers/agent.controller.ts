import { Request, Response } from "express";
import { checkAIConnection, runAgentFlow } from "../services/agent.service";
import errorHandler from "../middlewares/error-handler";

export async function checkAIConnectionController(req: Request, res: Response) {
  try {
    const response = await checkAIConnection();
    res.json(response);
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export async function askAgentController(req: Request, res: Response) {
  const { question, database } = req.body;
  if (!question || !database)
    return res.status(400).json({ error: "Invalid request body" });

  try {
    const result = await runAgentFlow(question, database);
    res.json({ message: "Agent flow executed successfully!", data: result });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export default { askAgentController };

import { Request, response, Response } from "express";
import {
  checkAIConnection,
  generateInsights,
  viewInsights,
  runAgentFlow,
} from "../services/agent.service";
import errorHandler from "../middlewares/error-handler";

async function checkAIConnectionController(req: Request, res: Response) {
  try {
    const response = await checkAIConnection();
    res.json(response);
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function generateInsightsController(req: Request, res: Response) {
  const { body, user } = req;
  const { databaseId, databaseName } = body;

  if (!databaseId || !databaseName)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const response = await generateInsights(databaseId, databaseName, user.id);
    res.json({ message: "Insights generated successfully!", response });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function viewInsightsController(req: Request, res: Response) {
  const { user } = req;
  const { databaseId } = req.params;
  if (!databaseId)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const response = await viewInsights(databaseId, user.id);
    res.json({ message: "Insights retrieved successfully!", response });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function askAgentController(req: Request, res: Response) {
  const { body, user } = req;
  const { question, databaseId, currentChatId } = body;

  if (!question || !databaseId)
    return res.status(400).json({ error: "Invalid request body" });

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const result = await runAgentFlow(
      question,
      databaseId,
      user.id,
      currentChatId
    );
    res.json({
      message: "Agent flow executed successfully!",
      response: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export {
  checkAIConnectionController,
  generateInsightsController,
  viewInsightsController,
  askAgentController,
};

import { Request, Response } from "express";
import {
  saveChatWithMessages,
  getChatsWithMessages,
  getChatWithMessages,
  deleteChatWithMessages,
  getChatsForDatabase,
} from "../services";
import errorHandler from "../middlewares/error-handler";

async function saveChatController(req: Request, res: Response) {
  const { body, user } = req;
  const { title, database_id, messages, metadata } = body;

  if (!title || !database_id || !messages) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const data = await saveChatWithMessages(
      user.id,
      title,
      database_id,
      messages,
      metadata
    );
    res
      .status(200)
      .json({ message: "Chat saved successfully", response: data });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function getChatsController(req: Request, res: Response) {
  const { user } = req;

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const data = await getChatsWithMessages(user.id);
    res.json({ message: "Chats retrieved successfully", response: data });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function getChatController(req: Request, res: Response) {
  const { id } = req.params;
  const { user } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const data = await getChatWithMessages(id);
    if (!data) {
      return res.status(404).json({ error: "Chat not found" });
    }
    // Check if chat belongs to user
    if (data.user_id !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ message: "Chat retrieved successfully", response: data });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function deleteChatController(req: Request, res: Response) {
  const { id } = req.params;
  const { user } = req;

  if (!id) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    await deleteChatWithMessages(id, user.id);
    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function getChatsForDatabaseController(req: Request, res: Response) {
  const { databaseId } = req.params;
  const { user } = req;

  if (!databaseId) {
    return res.status(400).json({ error: "Database ID is required" });
  }

  if (!user || !user.id)
    return res.status(400).json({ error: "User not found" });

  try {
    const data = await getChatsForDatabase(databaseId, user.id);
    res.json({ message: "Chats retrieved successfully", response: data });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export {
  saveChatController,
  getChatsController,
  getChatController,
  deleteChatController,
  getChatsForDatabaseController,
};

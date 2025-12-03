import express from "express";
import {
  saveChatController,
  getChatsController,
  getChatController,
  deleteChatController,
  getChatsForDatabaseController,
} from "../controllers/chat.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

// Upsert chat with messages
router.post("/", requireAuth, saveChatController);

// Get list of chats with messages
router.get("/", requireAuth, getChatsController);

// Get single chat with messages
router.get("/:id", requireAuth, getChatController);

// Delete a chat with messages
router.delete("/:id", requireAuth, deleteChatController);

// Get list of chats with messages for a database Id
router.get("/database/:databaseId", requireAuth, getChatsForDatabaseController);

export default router;

import express from "express";
import {
  askAgentController,
  checkAIConnectionController,
} from "../controllers/agent.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.get("/check-ai-connection", requireAuth, checkAIConnectionController);
router.post("/ask-agent", requireAuth, askAgentController);

export default router;

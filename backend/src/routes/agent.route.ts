import express from "express";
import {
  askAgentController,
  checkAIConnectionController,
  generateInsightsController,
  viewInsightsController,
} from "../controllers/agent.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.get("/check-ai-connection", requireAuth, checkAIConnectionController);
router.post("/generate-insights", requireAuth, generateInsightsController);
router.get("/view-insights/:databaseId", requireAuth, viewInsightsController);
router.post("/ask-agent", requireAuth, askAgentController);

export default router;

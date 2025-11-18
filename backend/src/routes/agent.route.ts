import express from "express";
import {
  askAgentController,
  checkAIConnectionController,
} from "../controllers/agent.controller";

const router = express.Router();

router.get("/check-ai-connection", checkAIConnectionController);
router.post("/ask-agent", askAgentController);

export default router;

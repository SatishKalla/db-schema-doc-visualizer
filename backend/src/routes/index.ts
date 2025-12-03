import express from "express";
import authRouter from "./auth.route";
import dbRouter from "./db.route";
import agentRouter from "./agent.route";
import accessRequestRouter from "./access-request.route";
import chatRouter from "./chat.route";

const router = express.Router();

// Mount sub-routers. Each sub-router defines its own paths.
router.use("/auth", authRouter);
router.use("/agent", agentRouter);
router.use("/db", dbRouter);
router.use("/request", accessRequestRouter);
router.use("/chat", chatRouter);

export default router;

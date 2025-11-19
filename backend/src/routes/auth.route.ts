import express from "express";
import { loginController } from "../controllers";
import { logoutController } from "../controllers";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout", requireAuth, logoutController);
export default router;

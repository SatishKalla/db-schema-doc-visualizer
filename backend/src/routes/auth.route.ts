import express from "express";
import { loginController } from "../controllers";
import { logoutController } from "../controllers";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
export default router;

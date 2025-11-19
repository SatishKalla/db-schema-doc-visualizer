import express from "express";
import {
  approveOrRejectRequestController,
  getRequestsController,
  requestAccessController,
  deleteUserController,
} from "../controllers/request-access.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/access", requestAccessController);
router.get("/admin/requests", requireAuth, getRequestsController);
router.patch(
  "/admin/requests/:id/:status",
  requireAuth,
  approveOrRejectRequestController
);
router.delete("/admin/requests/:id", requireAuth, deleteUserController);

export default router;

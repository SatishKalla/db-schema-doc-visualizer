import express from "express";
import {
  approveOrRejectRequestController,
  getRequestsController,
  requestAccessController,
  deleteUserController,
} from "../controllers/request-access.controller";

const router = express.Router();

router.post("/access", requestAccessController);
router.get("/admin/requests", getRequestsController);
router.patch("/admin/requests/:id/:status", approveOrRejectRequestController);
router.delete("/admin/requests/:id", deleteUserController);

export default router;

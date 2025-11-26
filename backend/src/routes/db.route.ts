import express from "express";
import {
  createConnectionController,
  updateConnectionController,
  listConnectionController,
  deleteConnectionController,
  listDatabasesController,
  createDatabaseController,
  listSelectedDatabaseController,
  deleteDatabaseController,
} from "../controllers/db.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/connection", requireAuth, createConnectionController);
router.patch(
  "/connection/:connectionId",
  requireAuth,
  updateConnectionController
);
router.get("/connection", requireAuth, listConnectionController);
router.delete(
  "/connection/:connectionId",
  requireAuth,
  deleteConnectionController
);
router.post("/list-databases", requireAuth, listDatabasesController);
router.post("/database", requireAuth, createDatabaseController);
router.get("/database", requireAuth, listSelectedDatabaseController);
router.delete("/database/:databaseId", requireAuth, deleteDatabaseController);

export default router;

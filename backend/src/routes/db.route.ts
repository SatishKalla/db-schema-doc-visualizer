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
  generateSchemaDocController,
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
router.get(
  "/generate-schema-doc/:database",
  requireAuth,
  generateSchemaDocController
);

export default router;

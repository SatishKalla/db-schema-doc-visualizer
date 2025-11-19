import express from "express";
import {
  listDatabasesController,
  generateSchemaDocController,
} from "../controllers/db.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/list-databases", requireAuth, listDatabasesController);
router.get(
  "/generate-schema-doc/:database",
  requireAuth,
  generateSchemaDocController
);

export default router;

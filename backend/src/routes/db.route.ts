import express from "express";
import {
  listDatabasesController,
  generateSchemaDocController,
} from "../controllers/db.controller";

const router = express.Router();

router.post("/list-databases", listDatabasesController);
router.get("/generate-schema-doc/:database", generateSchemaDocController);

export default router;

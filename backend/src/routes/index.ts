import express from "express";
import {
  checkAIConnection,
  generateDiagramAndDocs,
  listDatabases,
  runAgentFlow,
} from "../services/index";

const router = express.Router();

router.get("/check-ai-connection", async (req, res) => {
  try {
    const response = await checkAIConnection();
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.post("/list-databases", async (req, res) => {
  try {
    if (!req.body || !req.body.client || !req.body.connection) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const result = await listDatabases(req.body);

    res.json({ message: "Databases retrieved successfully!", data: result });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.get("/generate-schema-doc/:database", async (req, res) => {
  try {
    if (!req.params.database) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { database } = req.params;

    const parsed = await generateDiagramAndDocs(database);

    res.json({
      message: "Schema documentation generated successfully!",
      data: parsed,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.post("/ask-agent", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const result = await runAgentFlow(question);

    res.json({
      message: "Agent flow executed successfully!",
      data: result,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;

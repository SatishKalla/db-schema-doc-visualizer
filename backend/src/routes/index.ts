import express from "express";
import { checkGeminiApi, generateDiagramAndDocs } from "../services/index";

const router = express.Router();

router.get("/check-gemini-api", async (req, res) => {
  try {
    const response = await checkGeminiApi();
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.post("/generate-schema-doc", async (req, res) => {
  try {
    const { schemaText } = req.body;
    if (!schemaText)
      return res.status(400).json({ error: "schemaText is required" });

    const parsed = await generateDiagramAndDocs(schemaText);

    res.json(parsed);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;

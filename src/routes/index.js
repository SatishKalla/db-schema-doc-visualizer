const express = require("express");
const router = express.Router();
const { checkGeminiApi, generateDiagramAndDocs } = require("../services/index");

router.get("/check-gemini-api", async (req, res) => {
  try {
    const response = await checkGeminiApi();
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate-schema-doc", async (req, res) => {
  try {
    const { schemaText } = req.body;
    if (!schemaText)
      return res.status(400).json({ error: "schemaText is required" });

    const parsed = await generateDiagramAndDocs(schemaText);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import { GoogleGenAI } from "@google/genai";
import { GEMINI_AI_API_KEY } from "../config";

const ai = new GoogleGenAI({ apiKey: GEMINI_AI_API_KEY });

async function checkGeminiApi() {
  try {
    return ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
  } catch (err) {
    throw err;
  }
}

async function generateDiagramAndDocs(schemaText: string) {
  // carefully craft the prompt to get consistent JSON output
  const model = `You are an assistant that converts database schemas or descriptions into a mermaid ER diagram and clear documentation. Output ONLY a JSON object with three fields: title, mermaid, documentation. The mermaid field must contain a \"erDiagram\" (mermaid ER) or a \"classDiagram\" suitable for visualizing tables and relations. The documentation should be markdown giving table descriptions, columns, types, PK/FK, and example queries.`;

  const user = `Schema or description:\n\n${schemaText}\n\nReturn the JSON object only. No explanatory text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "model", parts: [{ text: model }] },
      { role: "user", parts: [{ text: user }] },
    ],
    config: {
      temperature: 0.0,
      maxOutputTokens: 1500,
    },
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from GeminiAI");

  // Remove possible code block markers and trim whitespace
  const cleaned = text.replace(/^```json\s*|```\s*$/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: extract JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error(
        "Failed to parse JSON from GeminiAI response:\n" + cleaned
      );
    }
  }

  return parsed;
}

export { checkGeminiApi, generateDiagramAndDocs };

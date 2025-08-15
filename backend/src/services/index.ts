import { chatModel } from "../utils/ai-models";

async function checkGeminiApi() {
  try {
    const model = chatModel();
    const response = await model.invoke("Explain how AI works in a few words");
    return response.content;
  } catch (err) {
    throw err;
  }
}

async function generateDiagramAndDocs(schemaText: string) {
  // carefully craft the prompt to get consistent JSON output
  const systemPrompt = `You are an assistant that converts database schemas or descriptions into a mermaid ER diagram and clear documentation. Output ONLY a JSON object with three fields: title, mermaid, documentation. The mermaid field must contain a \"erDiagram\" (mermaid ER) or a \"classDiagram\" suitable for visualizing tables and relations. The documentation should be markdown giving table descriptions, columns, types, PK/FK, and example queries.`;

  const userPrompt = `Schema or description:\n\n${schemaText}\n\nReturn the JSON object only. No explanatory text.`;

  const model = chatModel();
  const response = await model.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "human",
      content: userPrompt,
    },
  ]);

  let text: string;
  if (!response.content) throw new Error("No response from Model");

  if (typeof response.content === "string") {
    text = response.content;
  } else if (Array.isArray(response.content)) {
    text = response.content
      .map((c: any) => (typeof c === "string" ? c : c.text || ""))
      .join("\n");
  } else if (
    typeof response.content === "object" &&
    "text" in response.content
  ) {
    text = (response.content as any).text;
  } else {
    throw new Error("Unexpected response.content type");
  }

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

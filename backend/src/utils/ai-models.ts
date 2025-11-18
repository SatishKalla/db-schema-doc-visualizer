import { ChatOpenAI } from "@langchain/openai";
import { OPENROUTER_API_KEY, OPENROUTER_BASE_URL, MODEL } from "../config";
import logger from "./logger";

logger.info("ai-models: initializing chatModel", { model: MODEL });

export const chatModel = new ChatOpenAI({
  modelName: MODEL,
  temperature: 0.2,
  apiKey: OPENROUTER_API_KEY,
  configuration: {
    baseURL: `${OPENROUTER_BASE_URL}/api/v1`,
    defaultHeaders: {
      "HTTP-Referer": "https://localhost:3000/",
      "X-Title": "Langchain.js Testing",
    },
  },
});

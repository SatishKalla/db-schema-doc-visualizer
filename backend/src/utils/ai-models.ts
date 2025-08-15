import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function chatModel(provider = process.env.LLM_PROVIDER || "openai") {
  if (provider === "gemini") {
    return new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      maxOutputTokens: 2048,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 2048,
    temperature: 0.2,
  });
}

export { chatModel };

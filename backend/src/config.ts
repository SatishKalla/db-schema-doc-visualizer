import dotenv from "dotenv";
dotenv.config();

export const PORT_BACKEND = Number(process.env.PORT ?? 3000);
export const HF_API_KEY = process.env.HF_API_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai";
export const MODEL = process.env.MODEL ?? "gpt-4o-mini";
export const EMB_MODEL = process.env.EMB_MODEL ?? "text-embedding-3-small";
export const FE_URL = process.env.FE_URL ?? "http://localhost:5173";

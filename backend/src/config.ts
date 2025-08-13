import dotenv from "dotenv";
dotenv.config();

export const PORT_BACKEND = Number(process.env.PORT ?? 3000);
export const GEMINI_AI_API_KEY = process.env.GEMINI_AI_API_KEY ?? "";

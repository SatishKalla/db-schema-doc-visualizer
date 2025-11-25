import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT ?? 3000),
  hfApiKey: process.env.HF_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai",
  model: process.env.MODEL ?? "gpt-4o-mini",
  embModel: process.env.EMB_MODEL ?? "text-embedding-3-small",
  feUrl: process.env.FE_URL ?? "http://localhost:5173",
  supabaseUrl:
    process.env.SUPABASE_URL ?? "https://ngwdbdiwcmwgvfvaptti.supabase.co",
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  encryptionKey:
    process.env.ENCRYPTION_KEY ?? "default-key-change-in-production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
};

export default config;

// named exports for backward compatibility
export const PORT_BACKEND = config.port;
export const HF_API_KEY = config.hfApiKey;
export const OPENAI_API_KEY = config.openaiApiKey;
export const GOOGLE_API_KEY = config.googleApiKey;
export const OPENROUTER_API_KEY = config.openrouterApiKey;
export const OPENROUTER_BASE_URL = config.openrouterBaseUrl;
export const MODEL = config.model;
export const EMB_MODEL = config.embModel;
export const FE_URL = config.feUrl;
export const SUPABASE_URL = config.supabaseUrl;
export const SUPABASE_SERVICE_ROLE_KEY = config.supabaseServiceRoleKey;
export const ENCRYPTION_KEY = config.encryptionKey;
export const NODE_ENV = config.nodeEnv;

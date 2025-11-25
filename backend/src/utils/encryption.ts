import crypto from "crypto";
import { ENCRYPTION_KEY } from "../config";

const CRY_ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
const ALGORITHM = "aes-256-cbc";

export const encryptPassword = (password: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, CRY_ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptPassword = (encryptedPassword: string): string => {
  const parts = encryptedPassword.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = parts.join(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, CRY_ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

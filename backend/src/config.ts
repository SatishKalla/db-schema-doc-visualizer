import dotenv from "dotenv";
dotenv.config();

export const PORT_BACKEND = Number(process.env.PORT ?? 3000);

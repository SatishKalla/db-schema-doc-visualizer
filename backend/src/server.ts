import dotenv from "dotenv";
import app from "./app";
import logger from "./utils/logger";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err as Error);
  process.exit(1);
});

export default server;

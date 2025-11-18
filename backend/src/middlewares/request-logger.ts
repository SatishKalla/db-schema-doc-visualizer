import morgan from "morgan";
import logger from "../utils/logger";

// Use morgan to log requests and pipe into winston logger
export const requestLogger = morgan("combined", {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});

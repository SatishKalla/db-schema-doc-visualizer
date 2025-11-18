import winston from "winston";
import config from "../config";

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: config.logLevel || "info",
  format: combine(timestamp(), colorize(), myFormat),
  transports: [new winston.transports.Console()],
});

export default logger;

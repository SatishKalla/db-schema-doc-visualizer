import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err?.statusCode ?? 500;
  const message = err?.message ?? "Internal Server Error";

  logger.error("HTTP Error", { status, message, stack: err?.stack });

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}

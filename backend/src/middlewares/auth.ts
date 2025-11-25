import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";
import { supabase } from "../clients/supabase-client";
import logger from "../utils/logger";
import errorHandler from "./error-handler";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user)
      throw new Error("Invalid or expired token, Please log in again");

    req.user = data.user;
    next();
  } catch (error) {
    logger.error("authenticateUser: error", { error });
    return errorHandler(error, req, res, next);
  }
};

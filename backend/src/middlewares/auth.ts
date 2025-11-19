import { supabase } from "../clients/supabase-client";
import logger from "../utils/logger";
import errorHandler from "./error-handler";

export const requireAuth = async (req, res, next) => {
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

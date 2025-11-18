import logger from "../utils/logger";
import { supabase } from "../clients/supabase-client";

async function authenticateUser(email: string, password: string) {
  try {
    logger.info("authenticateUser: starting user authentication");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    logger.info("authenticateUser: received response from authentication");

    const userData = { ...data.user, name: profile?.full_name || "Admin" };
    return { ...data, user: userData };
  } catch (error) {
    logger.error("authenticateUser: error", { error });
    throw new Error(`User authentication failed: ${JSON.stringify(error)}`);
  }
}

async function logoutUser() {
  try {
    logger.info("logoutUser: starting user logout");
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    logger.info("logoutUser: user logged out successfully");
  } catch (error) {
    logger.error("logoutUser: error", { error });
    throw new Error(`User logout failed: ${JSON.stringify(error)}`);
  }
}

export { authenticateUser, logoutUser };

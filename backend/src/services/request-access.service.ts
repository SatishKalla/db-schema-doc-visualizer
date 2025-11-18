import logger from "../utils/logger";
import { supabase } from "../clients/supabase-client";

async function saveAccessRequest(full_name: string, email: string) {
  try {
    logger.info(
      `saveAccessRequest: starting to save access request - ${JSON.stringify({
        full_name,
        email,
      })}`
    );

    const { data, error } = await supabase
      .from("access_requests")
      .insert([{ full_name, email }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    logger.info(
      `saveAccessRequest: access request saved successfully - ${JSON.stringify({
        data,
      })}`
    );
    return data;
  } catch (error) {
    logger.error(
      `saveAccessRequest: error saving access request - ${JSON.stringify({
        error,
      })}`
    );
    throw new Error(`Failed to save access request: ${JSON.stringify(error)}`);
  }
}

async function getRequests(status: string) {
  try {
    logger.info(`getRequests: starting to get requests - ${status}`);

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", status || "pending");

    if (error) throw new Error(error.message);
    logger.info(
      `getRequests: requests retrieved successfully - ${JSON.stringify({
        data,
      })}`
    );
    return data;
  } catch (error) {
    logger.error(`getRequests: error - ${JSON.stringify({ error })}`);
    throw new Error(`Get requests failed: ${JSON.stringify(error)}`);
  }
}

async function approveOrRejectRequest(
  id: string,
  status: string,
  reviewed_by: string
) {
  try {
    logger.info(
      `approveOrRejectRequest: starting - ${JSON.stringify({
        id,
        status,
        reviewed_by,
      })}`
    );
    // Fetch the request first
    const { data: request } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", id)
      .eq("status", "pending")
      .single();

    if (!request) throw new Error("Request not found");

    if (status === "rejected") {
      // Update status to rejected
      const { error: rejectError } = await supabase
        .from("access_requests")
        .update({
          status: "rejected",
          reviewed_by,
          reviewed_at: new Date(),
        })
        .eq("id", id);

      if (rejectError) throw new Error(rejectError.message);

      logger.info(
        `approveOrRejectRequest: request rejected successfully - ${JSON.stringify(
          {
            id,
            reviewed_by,
          }
        )}`
      );

      return { message: "Request rejected successfully" };
    }

    // Create Supabase Auth account for approved user
    const password = Math.random().toString(36).slice(-8);
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: request.email,
        password,
        email_confirm: true,
      });

    if (authError)
      throw new Error("Failed to create user: " + authError.message);

    // Insert into profiles table
    await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        full_name: request.full_name,
      },
    ]);

    // Update access request status
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status: "approved",
        reviewed_by,
        reviewed_at: new Date(),
      })
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    logger.info(
      `approveOrRejectRequest: request approved successfully - ${JSON.stringify(
        {
          id,
          reviewed_by,
        }
      )}`
    );

    return { user: authData.user, password };
  } catch (error) {
    logger.error(
      `approveOrRejectRequest: error - ${JSON.stringify({
        error,
        id,
        status,
        reviewed_by,
      })}`
    );
    throw new Error(`approveOrRejectRequest: error ${JSON.stringify(error)}`);
  }
}

async function deleteUser(id: string) {
  try {
    logger.info(`deleteUser: starting to delete user - ${id}`);
    const { data: request } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", id)
      .single();

    const { data: usersList } = await supabase.auth.admin.listUsers();

    const user = usersList.users.find((u) => u.email === request.email);

    if (user) {
      const { error: delAuthErr } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (delAuthErr) {
        throw new Error(delAuthErr.message);
      }
    }

    const { error: delReqErr } = await supabase
      .from("access_requests")
      .delete()
      .eq("id", id);

    if (delReqErr) {
      throw new Error(delReqErr.message);
    }

    logger.info(`deleteUser: user deleted successfully - ${id}`);
  } catch (error) {
    logger.error(
      `deleteUser: error deleting user - ${JSON.stringify({ error, id })}`
    );
    throw new Error(`Failed to delete user: ${JSON.stringify(error)}`);
  }
}

export { saveAccessRequest, getRequests, approveOrRejectRequest, deleteUser };

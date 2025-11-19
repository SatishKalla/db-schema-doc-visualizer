import { Request, Response } from "express";
import {
  approveOrRejectRequest,
  getRequests,
  saveAccessRequest,
  deleteUser,
} from "../services";
import errorHandler from "../middlewares/error-handler";

async function requestAccessController(req: Request, res: Response) {
  const body = req.body;

  if (!body || !body.full_name || !body.email)
    return res.status(400).json({ error: "Full name and email are required" });

  try {
    const { full_name, email } = body;
    const data = await saveAccessRequest(full_name, email);
    res.json({ message: "Request submitted successfully", response: data });
  } catch (error: any) {
    return errorHandler(error, req, res);
  }
}

async function getRequestsController(req: Request, res: Response) {
  const { status } = req.query;

  if (!status)
    return res.status(400).json({ error: "Invalid request query parameters" });

  try {
    const data = await getRequests(status as string);
    res.json({ message: "Requests retrieved successfully", response: data });
  } catch (error: any) {
    return errorHandler(error, req, res);
  }
}

async function approveOrRejectRequestController(req: Request, res: Response) {
  const { id, status } = req.params;
  const { reviewed_by } = req.body;

  if (!id || !status || !reviewed_by)
    return res
      .status(400)
      .json({ error: "Invalid request parameters or body" });

  try {
    const user = await approveOrRejectRequest(id, status, reviewed_by);

    res.json({
      message: "User approved and created successfully",
      response: user,
    });
  } catch (error: any) {
    return errorHandler(error, req, res);
  }
}

async function deleteUserController(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    await deleteUser(id);
    res.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return errorHandler(error, req, res);
  }
}

export {
  requestAccessController,
  getRequestsController,
  approveOrRejectRequestController,
  deleteUserController,
};

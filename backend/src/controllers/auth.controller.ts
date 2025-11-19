import { Request, Response } from "express";
import { authenticateUser, logoutUser } from "../services";
import errorHandler from "../middlewares/error-handler";

async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const data = await authenticateUser(email, password);

    res.json({ message: "Login successful", response: data });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function logoutController(req: Request, res: Response) {
  try {
    await logoutUser();
    res.json({ message: "Logout successful" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

export { loginController, logoutController };

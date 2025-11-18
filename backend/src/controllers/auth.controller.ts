import { Request, Response } from "express";
import { authenticateUser, logoutUser } from "../services";

async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const data = await authenticateUser(email, password);

  res.json({ message: "Login successful", response: data });
}

async function logoutController(req: Request, res: Response) {
  await logoutUser();
  res.json({ message: "Logout successful" });
}

export { loginController, logoutController };

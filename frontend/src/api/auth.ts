import type { LoginRequest, AuthResponse } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Handle login request. Returns AuthResponse on success or throws an Error.
export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const { response, error, message } = await res.json();
  if (!res.ok) {
    throw new Error(error?.message || "Login failed");
  }

  return { response, message } as AuthResponse;
}

// Optional: notify server to invalidate token
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
    });
  } catch {
    // best-effort logout, swallow errors
  }
}

import type { LoginRequest, AuthResponse } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Handle login request. Returns AuthResponse on success or throws an Error.
export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || "Login failed");
  }

  const data = await res.json();
  return data as AuthResponse;
}

// Optional: notify server to invalidate token
export async function logoutUser(token?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // best-effort logout, swallow errors
  }
}

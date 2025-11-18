import type { RequestAccessPayload } from "../types/access";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Send a request to the server to request access.
// Throws an Error when the response is not ok.
export async function requestAccess(
  payload: RequestAccessPayload
): Promise<{ message?: string } | void> {
  const res = await fetch(`${API_BASE}/request/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Try to read a structured error message from the server
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || "Request failed");
  }

  // Return the parsed response if any
  try {
    const data = await res.json();
    return data;
  } catch {
    return;
  }
}

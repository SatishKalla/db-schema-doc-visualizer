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

  const data = await res.json();
  const { error } = data;
  if (!res.ok) {
    throw new Error(error?.message || "Request failed");
  }

  // Return the parsed response if any
  try {
    return data;
  } catch {
    return;
  }
}

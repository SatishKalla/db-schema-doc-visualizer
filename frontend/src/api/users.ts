const API_BASE = import.meta.env.VITE_API_URL || "";

export interface User {
  id: string;
  name: string;
  email: string;
  status?: "pending" | "approved" | "rejected";
}

// Fetch all users with a specific status
export async function getUsersByStatus(status: string): Promise<User[]> {
  const res = await fetch(
    `${API_BASE}/request/admin/requests?status=${encodeURIComponent(status)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || "Failed to fetch users");
  }

  const data = await res.json();
  // Map API response to User interface
  return (data.response || []).map((user: Record<string, unknown>) => ({
    id: (user.id || user._id) as string,
    name: (user.full_name || user.name || "N/A") as string,
    email: user.email as string,
    status: (user.status || "pending") as "pending" | "approved" | "rejected",
  }));
}

// Approve or Reject a user
export async function approveOrRejectUser(
  userId: string,
  status: "pending" | "approved" | "rejected",
  reviewedBy: string
): Promise<{
  password: string;
  user: User;
}> {
  const res = await fetch(
    `${API_BASE}/request/admin/requests/${userId}/${status}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed_by: reviewedBy }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || "Failed to approve or reject user");
  }

  const data = await res.json();
  return {
    password: data.response.password,
    user: {
      id: data.response.id || data.response._id,
      name: data.response.full_name || data.response.name,
      email: data.response.email,
      status: status,
    },
  };
}

// Delete a user (optional - depends on backend implementation)
export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/request/admin/requests/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || "Failed to delete user");
  }
}

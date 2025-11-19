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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
    }
  );

  const { response, error } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to fetch users");
  }
  // Map API response to User interface
  return (response || []).map((user: Record<string, unknown>) => ({
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
      body: JSON.stringify({ reviewed_by: reviewedBy }),
    }
  );

  const { response, error } = await res.json();
  if (!res.ok) {
    throw new Error(error?.message || "Failed to approve or reject user");
  }

  return {
    password: response.password,
    user: {
      id: response.id || response._id,
      name: response.full_name || response.name,
      email: response.email,
      status: status,
    },
  };
}

// Delete a user (optional - depends on backend implementation)
export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/request/admin/requests/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { error } = await res.json();
  if (!res.ok) {
    throw new Error(error?.message || "Failed to delete user");
  }
}

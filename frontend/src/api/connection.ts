import type { Connection } from "../types/connection";

const API_BASE = import.meta.env.VITE_API_URL || "";

export const fetchConnections = async () => {
  const res = await fetch(`${API_BASE}/db/connection`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });
  const { response, error } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to fetch connections");
  }

  const mappedConnections: Connection[] = response.map((conn) => ({
    id: conn.id,
    name: conn.name,
    db_type: conn.db_type,
    host: conn.host,
    port: conn.port,
    db_user: conn.db_user,
    db_password: conn.db_password,
    user_id: conn.user_id,
    recentDatabase: conn.recent_database_id,
    lastConnected: conn.last_connected_at
      ? new Date(conn.last_connected_at).toLocaleString()
      : "",
    created_at: conn.created_at,
    updated_at: conn.updated_at,
    databases: {
      name: conn.databases?.name || "",
      id: conn.databases?.id || "",
    },
  }));

  return mappedConnections;
};

export const removeConnection = async (connectionId: string) => {
  const res = await fetch(`${API_BASE}/db/connection/${connectionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });
  const { response, error } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to remove connection");
  }

  return response;
};

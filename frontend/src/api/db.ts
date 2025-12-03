import type { ConnectionPayload } from "../types/connection";

const API_BASE = import.meta.env.VITE_API_URL || "";

export const connectToDatabase = async (name: string, connectionId: string) => {
  const res = await fetch(`${API_BASE}/db/connection/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({ name, connectionId }),
  });

  const { error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to connect to database");
  }

  return {
    message,
  };
};

export const listDatabases = async (payload: ConnectionPayload) => {
  const res = await fetch(`${API_BASE}/db/list-databases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify(payload),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to fetch databases");
  }

  return {
    response,
    message,
  };
};

export const updateConnection = async (
  id: string,
  payload: ConnectionPayload
) => {
  const res = await fetch(`${API_BASE}/db/connection/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({ connection: payload.connection }),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to update connection");
  }

  return {
    response,
    message,
  };
};

export const generateSchemaDoc = async (database: string) => {
  const res = await fetch(`${API_BASE}/db/generate-schema-doc/${database}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const response = await res.json();

  if (!res.ok || response.error) {
    throw new Error(response.error || "Failed to generate schema doc");
  }

  return response;
};

export const listSelectedDatabases = async () => {
  const res = await fetch(`${API_BASE}/db/database`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to fetch databases");
  }

  return {
    response,
    message,
  };
};

export const deleteDatabase = async (databaseId: string) => {
  const res = await fetch(`${API_BASE}/db/database/${databaseId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to delete database");
  }

  return {
    response,
    message,
  };
};

export const createDatabase = async (connectionId: string, name: string) => {
  const res = await fetch(`${API_BASE}/db/database`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({ connectionId, name }),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to create database");
  }

  return {
    response,
    message,
  };
};

export const getDatabasesForConnection = async (connectionId: string) => {
  const res = await fetch(
    `${API_BASE}/db/database/connection/${connectionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
    }
  );

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(
      error?.message || "Failed to fetch databases for connection"
    );
  }

  return {
    response,
    message,
  };
};

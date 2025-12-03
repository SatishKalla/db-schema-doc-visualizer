import type { Database } from "../pages/databases/Databases";

const API_BASE = import.meta.env.VITE_API_URL || "";

export const generateInsights = async (database: Database) => {
  const res = await fetch(`${API_BASE}/agent/generate-insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({
      databaseId: database.id,
      databaseName: database.name,
    }),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to generate insights");
  }

  return {
    response,
    message,
  };
};

export const viewInsights = async (databaseId: string) => {
  const res = await fetch(`${API_BASE}/agent/view-insights/${databaseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to view insights");
  }

  return {
    response,
    message,
  };
};

export const askAgent = async (
  question: string,
  databaseId: string,
  connectionId: string,
  currentChatId: string | undefined
) => {
  const res = await fetch(`${API_BASE}/agent/ask-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({
      question,
      databaseId,
      connectionId,
      currentChatId,
    }),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "No response from agent");
  }

  return {
    response,
    message,
  };
};

export const getChats = async (databaseId: string) => {
  const res = await fetch(`${API_BASE}/agent/chats/${databaseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to get chats");
  }

  return {
    response,
    message,
  };
};

const API_BASE = import.meta.env.VITE_API_URL || "";

export const getChatsForDatabase = async (databaseId: string) => {
  const res = await fetch(`${API_BASE}/chat/database/${databaseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to get chats for database");
  }

  return {
    response,
    message,
  };
};

export const saveChat = async (
  title: string,
  databaseId: string,
  messages: Array<{
    role: string;
    content: string;
    content_type?: string;
    model?: string;
    tokens_used?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
  }>
) => {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
    body: JSON.stringify({
      title,
      database_id: databaseId,
      messages,
    }),
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to save chat");
  }

  return {
    response,
    message,
  };
};

export const getChat = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/chat/${chatId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to get chat");
  }

  return {
    response,
    message,
  };
};

export const deleteChat = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/chat/${chatId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  });

  const { response, error, message } = await res.json();

  if (!res.ok) {
    throw new Error(error?.message || "Failed to delete chat");
  }

  return {
    response,
    message,
  };
};

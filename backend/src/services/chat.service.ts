import logger from "../utils/logger";
import { supabase } from "../clients/supabase-client";

export interface Message {
  role: string;
  content: string;
  content_type?: string;
  model?: string;
  tokens_used?: number;
  embedding?: any;
  metadata?: any;
}

export interface ChatWithMessages {
  id: string;
  user_id: string;
  database_id?: string;
  title: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

async function saveChatWithMessages(
  userId: string,
  title: string,
  databaseId?: string,
  messages: Message[] = [],
  currentChatId?: string,
  metadata?: any
): Promise<ChatWithMessages> {
  try {
    logger.info(
      `saveChatWithMessages: ${JSON.stringify({
        userId,
        title,
        databaseId,
        messagesCount: messages.length,
      })}`
    );

    // Check if chat already exists
    const { data: existingChat, error: selectError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", currentChatId)
      .eq("user_id", userId)
      .eq("database_id", databaseId)
      .single();

    let chatId: string;

    if (existingChat) {
      // Chat exists, use existing chat ID
      chatId = existingChat.id;
      logger.info(`Updating existing chat: ${chatId}`);
    } else {
      // Chat does not exist, create new chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert([
          {
            user_id: userId,
            database_id: databaseId,
            title,
            metadata: metadata || {},
          },
        ])
        .select("id")
        .single();

      if (chatError) throw new Error(chatError.message);
      chatId = chatData.id;
      logger.info(`Created new chat: ${chatId}`);
    }

    // Insert messages if any
    if (messages.length > 0) {
      const messagesToInsert = messages.map((msg) => ({
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
        content_type: msg.content_type || "text",
        model: msg.model,
        tokens_used: msg.tokens_used || 0,
        embedding: msg.embedding,
        metadata: msg.metadata || {},
      }));

      const { error: messagesError } = await supabase
        .from("messages")
        .insert(messagesToInsert);

      if (messagesError) throw new Error(messagesError.message);
    }

    // Return chat with messages
    const result = await getChatWithMessages(chatId);
    if (!result) throw new Error("Failed to retrieve chat");
    return result;
  } catch (error) {
    logger.error(`saveChatWithMessages: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function getChatsWithMessages(
  userId: string
): Promise<ChatWithMessages[]> {
  try {
    logger.info(`getChatsWithMessages: userId: ${userId}`);

    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        messages (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  } catch (error) {
    logger.error(`getChatsWithMessages: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function getChatWithMessages(
  chatId: string
): Promise<ChatWithMessages | null> {
  try {
    logger.info(`getChatWithMessages: chatId: ${chatId}`);

    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        messages (*)
      `
      )
      .eq("id", chatId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    logger.error(`getChatWithMessages: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function deleteChatWithMessages(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    logger.info(
      `deleteChatWithMessages: ${JSON.stringify({ chatId, userId })}`
    );

    // First check if chat exists and belongs to user
    const chat = await getChatWithMessages(chatId);
    if (!chat || chat.user_id !== userId) {
      throw new Error("Chat not found or access denied");
    }

    // Delete messages first (cascade should handle this, but being explicit)
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId);

    if (messagesError) throw new Error(messagesError.message);

    // Delete chat
    const { error: chatError } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId);

    if (chatError) throw new Error(chatError.message);

    return true;
  } catch (error) {
    logger.error(`deleteChatWithMessages: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function getChatsForDatabase(
  databaseId: string,
  userId: string
): Promise<ChatWithMessages[]> {
  try {
    logger.info(
      `getChatsForDatabase: ${JSON.stringify({ databaseId, userId })}`
    );

    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        messages (*)
      `
      )
      .eq("database_id", databaseId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  } catch (error) {
    logger.error(`getChatsForDatabase: error: ${JSON.stringify(error)}`);
    throw error;
  }
}

export {
  saveChatWithMessages,
  getChatsWithMessages,
  getChatWithMessages,
  deleteChatWithMessages,
  getChatsForDatabase,
};

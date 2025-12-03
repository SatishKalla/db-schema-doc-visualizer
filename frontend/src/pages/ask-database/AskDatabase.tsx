import { useCallback, useEffect, useState } from "react";
import {
  Input,
  Tooltip,
  message,
  List,
  Button,
  Dropdown,
  Menu,
  Select,
  Spin,
} from "antd";
import {
  SendOutlined,
  LoadingOutlined,
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import "./AskDatabase.css";
import type { Connection } from "../../types/connection";
import type { Database } from "../databases/Databases";
import { fetchConnections } from "../../api/connection";
import { getDatabasesForConnection } from "../../api/db";
import { useLocation } from "react-router-dom";
import { askAgent } from "../../api/agent";
import {
  getChatsForDatabase,
  deleteChat as deleteChatApi,
} from "../../api/chat";

const { TextArea } = Input;

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  isLoading?: boolean;
}

interface BackendMessage {
  role: string;
  content: string;
  content_type?: string;
  model?: string;
  tokens_used?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  embedding?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// Helper functions to map between frontend and backend message formats
const mapBackendToFrontend = (
  backendMessages: BackendMessage[]
): ChatMessage[] => {
  return backendMessages.map((msg) => ({
    role: msg.role as "user" | "agent",
    text: msg.content,
  }));
};

const AskDatabase: React.FC = () => {
  const location = useLocation();
  const insights = location.state?.insights;
  const [loading, setLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [deleteChatLoading, setDeleteChatLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<
    string | undefined
  >(undefined);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(
    undefined
  );
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    undefined
  );
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);

  const currentChat = currentChatId
    ? chats.find((chat) => chat.id === currentChatId)
    : null;
  const messages = currentChat ? currentChat.messages : [];
  const displayMessages = currentChat ? currentChat.messages : currentMessages;

  const handleConnectionChange = useCallback(
    async (connectionId: string) => {
      setSelectedConnection(connectionId);
      setSelectedDatabase(undefined);
      setDatabases([]);
      if (connectionId) {
        try {
          setConnectionsLoading(true);
          const result = await getDatabasesForConnection(connectionId);
          setDatabases(result.response || []);
          if (insights?.database_id && !selectedDatabase) {
            setSelectedDatabase(insights.database_id);
          }
        } catch (error) {
          messageApi.open({
            type: "error",
            content: (error as Error).message,
          });
        } finally {
          setConnectionsLoading(false);
        }
      }
    },
    [insights, messageApi, selectedDatabase]
  );

  useEffect(() => {
    const fetchConnectionsData = async () => {
      setConnectionsLoading(true);
      try {
        const result = await fetchConnections();
        setConnections(result);
        if (insights?.connection.id && !selectedConnection) {
          setSelectedConnection(insights.connection.id);
          handleConnectionChange(insights.connection.id);
        }
      } catch (error) {
        messageApi.open({
          type: "error",
          content: (error as Error).message,
        });
      } finally {
        setConnectionsLoading(false);
      }
    };

    fetchConnectionsData();
  }, [insights, messageApi, selectedConnection, handleConnectionChange]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!selectedDatabase) {
        setChats([]);
        setCurrentChatId(undefined);
        return;
      }

      setChatsLoading(true);
      try {
        const result = await getChatsForDatabase(selectedDatabase);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedChats = result.response.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: mapBackendToFrontend(chat.messages || []),
        }));
        setChats(mappedChats);

        // Set current chat to the first one or create new if none
        if (mappedChats.length > 0) {
          setCurrentChatId(mappedChats[0].id);
        } else {
          setCurrentChatId(undefined);
        }
      } catch (error) {
        messageApi.open({
          type: "error",
          content: (error as Error).message,
        });
      } finally {
        setChatsLoading(false);
      }
    };

    fetchChats();
  }, [selectedDatabase, messageApi]);

  const handleAsk = async () => {
    if (!question) return;
    if (!selectedDatabase || !selectedConnection) {
      messageApi.open({
        type: "error",
        content: "Please select a connection and database first.",
      });
      return;
    }

    const userMessage = { role: "user" as const, text: question };
    const loadingMessage = {
      role: "agent" as const,
      text: "",
      isLoading: true,
    };

    // Update UI immediately with user message and loading message
    if (!currentChatId) {
      setCurrentMessages([userMessage, loadingMessage]);
    } else {
      const newMessages = [...messages, userMessage, loadingMessage];
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
        )
      );
    }
    setQuestion("");
    setLoading(true);
    try {
      const { response } = await askAgent(
        question,
        selectedDatabase,
        selectedConnection,
        currentChatId
      );

      if (response) {
        const agentMessage = { role: "agent" as const, text: response.output };
        const finalMessages = [userMessage, agentMessage];

        // Update UI
        if (!currentChatId) {
          const newId = response.chat.id;
          const newChat: ChatSession = {
            id: newId,
            title: response.title,
            messages: finalMessages,
          };
          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(newId);
          setCurrentMessages([]);
        } else {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, messages: [...messages, ...finalMessages] }
                : chat
            )
          );
        }
      } else {
        throw new Error(response.message || "Agent returned no data");
      }
    } catch (err: unknown) {
      // On error, remove the loading message
      if (!currentChatId) {
        setCurrentMessages([]);
      } else {
        const errorMessages = [...messages, userMessage];
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: errorMessages }
              : chat
          )
        );
      }
      messageApi.open({ type: "error", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const cancelAsk = useCallback(() => {
    setLoading(false);
    setQuestion("");
  }, []);

  const createNewChat = useCallback(() => {
    setCurrentChatId(undefined);
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setDeleteChatLoading(true);
        // If it's a temp chat, just remove from local state
        if (chatId.startsWith("temp-")) {
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));
          if (currentChatId === chatId) {
            const remaining = chats.filter((chat) => chat.id !== chatId);
            setCurrentChatId(
              remaining.length > 0 ? remaining[0]?.id : undefined
            );
          }
          return;
        }

        // Delete from backend
        await deleteChatApi(chatId);

        // Remove from local state
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        if (currentChatId === chatId) {
          const remaining = chats.filter((chat) => chat.id !== chatId);
          setCurrentChatId(remaining.length > 0 ? remaining[0]?.id : undefined);
        }
      } catch (error) {
        messageApi.open({
          type: "error",
          content: (error as Error).message,
        });
      } finally {
        setDeleteChatLoading(false);
      }
    },
    [currentChatId, chats, messageApi]
  );

  return (
    <>
      {contextHolder}
      <div className="chat-modal-container">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="dropdowns">
              Connection:{" "}
              <Select
                placeholder="Select Connection"
                value={selectedConnection}
                onChange={handleConnectionChange}
                loading={!selectedConnection && connectionsLoading}
                options={connections.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
              Database:{" "}
              <Select
                placeholder="Select Database"
                value={selectedDatabase}
                onChange={setSelectedDatabase}
                loading={!!selectedConnection && connectionsLoading}
                options={databases.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                disabled={!selectedConnection}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={createNewChat}
              block
              disabled={!selectedConnection || !selectedDatabase}
            >
              New Chat
            </Button>
          </div>
          {selectedConnection && selectedDatabase && (
            <div className="chat-list">
              <Spin spinning={chatsLoading}>
                <List
                  dataSource={chats}
                  renderItem={(chat) => {
                    const menu = (
                      <Menu>
                        <Menu.Item
                          key="delete"
                          onClick={() => deleteChat(chat.id)}
                        >
                          Delete Chat
                        </Menu.Item>
                      </Menu>
                    );
                    return (
                      <List.Item
                        className={`chat-list-item ${
                          chat.id === currentChatId ? "active" : ""
                        }`}
                        onClick={() => selectChat(chat.id)}
                      >
                        <div className="chat-list-item-content">
                          <span className="chat-title">{chat.title}</span>
                          <Spin
                            spinning={
                              chat.id === currentChatId && deleteChatLoading
                            }
                          />
                          <Dropdown overlay={menu} trigger={["click"]}>
                            {!deleteChatLoading && (
                              <MoreOutlined
                                className="chat-menu-icon"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </Dropdown>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </Spin>
            </div>
          )}
        </div>
        <div className="chat-main">
          <div className="chat-messages-wrap">
            {displayMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-message-content">
                  {msg.isLoading ? (
                    <div className="thinking-text">
                      Thinking <SyncOutlined spin />
                    </div>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <div className="chat-input-container">
              <TextArea
                className="chat-textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about the database..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    void handleAsk();
                  }
                }}
              />
              <Tooltip title="Send">
                {!loading && (
                  <SendOutlined
                    onClick={() => void handleAsk()}
                    className={`chat-send-icon ${
                      question && selectedConnection && selectedDatabase
                        ? ""
                        : "disabled"
                    }`}
                  />
                )}
              </Tooltip>

              <Tooltip title="Stop">
                {loading && (
                  <LoadingOutlined
                    onClick={cancelAsk}
                    className="chat-loading-icon"
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AskDatabase;

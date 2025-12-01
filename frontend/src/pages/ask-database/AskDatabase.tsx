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
} from "antd";
import {
  SendOutlined,
  LoadingOutlined,
  PlusOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import "./AskDatabase.css";
import type { Connection } from "../../types/connection";
import type { Database } from "../databases/Databases";
import { fetchConnections } from "../../api/connection";
import { getDatabasesForConnection } from "../../api/db";
import { useLocation } from "react-router-dom";
import { askAgent } from "../../api/agent";

const { TextArea } = Input;

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const AskDatabase: React.FC = () => {
  const location = useLocation();
  const insights = location.state?.insights;
  const [loading, setLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
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
  const [chats, setChats] = useState<ChatSession[]>([
    { id: "1", title: "New Chat", messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState("1");

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

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

  const handleAsk = async () => {
    if (!question) return;
    if (!selectedDatabase || !selectedConnection) {
      messageApi.open({
        type: "error",
        content: "Please select a connection and database first.",
      });
      return;
    }
    const newMessages = [
      ...messages,
      { role: "user" as const, text: question },
    ];
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
      )
    );

    setLoading(true);
    try {
      const { response } = await askAgent(
        question,
        selectedDatabase,
        selectedConnection
      );

      if (response) {
        const finalMessages = [
          ...newMessages,
          { role: "agent" as const, text: response.output },
        ];
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: finalMessages }
              : chat
          )
        );
        setQuestion("");
      } else {
        throw new Error(response.message || "Agent returned no data");
      }
    } catch (err: unknown) {
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
    const newId = Date.now().toString();
    const newChat: ChatSession = { id: newId, title: "New Chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newId);
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChatId === chatId) {
        const remaining = chats.filter((chat) => chat.id !== chatId);
        setCurrentChatId(remaining.length > 0 ? remaining[0].id : "");
      }
    },
    [currentChatId, chats]
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
                        <Dropdown overlay={menu} trigger={["click"]}>
                          <MoreOutlined
                            className="chat-menu-icon"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          )}
        </div>
        <div className="chat-main">
          <div className="chat-messages-wrap">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-message-content">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
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

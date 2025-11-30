import { useCallback, useState } from "react";
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
import { useLocation } from "react-router-dom";

const { TextArea } = Input;

// interface AskDatabaseProps {
//   insights?: {
//     databaseId: string;
//     databaseName: string;
//     insights_data: IInsightsData;
//   };
// }

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
  const [messageApi, contextHolder] = message.useMessage();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<
    string | undefined
  >(undefined);
  const [databases, setDatabases] = useState<any[]>([]);
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

  const handleAsk = useCallback(async () => {
    if (!question) return;
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user" as const, text: question },
    ];
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
      )
    );

    try {
      const database = localStorage.getItem("database") || "";

      if (database.trim() === "") {
        throw new Error(
          "No database selected. Please select a database first."
        );
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/agent/ask-agent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, database }),
        }
      );

      const response = await res.json();
      if (!response) throw new Error("No response from agent");
      if (response.error) throw new Error(response.error);

      if (response.data) {
        const finalMessages = [
          ...newMessages,
          { role: "agent" as const, text: response.data.output },
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
  }, [question, messages, messageApi, currentChatId]);

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
            {insights && (
              <div className="dropdowns">
                <Select
                  placeholder="Select Connection"
                  value={selectedConnection}
                  onChange={setSelectedConnection}
                  options={connections.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
                <Select
                  placeholder="Select Database"
                  value={selectedDatabase}
                  onChange={setSelectedDatabase}
                  options={databases.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                  disabled={!selectedConnection}
                />
              </div>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={createNewChat}
              block
            >
              New Chat
            </Button>
          </div>
          <div className="chat-list">
            <List
              dataSource={chats}
              renderItem={(chat) => {
                const menu = (
                  <Menu>
                    <Menu.Item key="delete" onClick={() => deleteChat(chat.id)}>
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
                    className={`chat-send-icon ${question ? "" : "disabled"}`}
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

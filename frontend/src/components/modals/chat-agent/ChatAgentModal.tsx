import { useCallback, useState } from "react";
import { Drawer, Input, List, Tooltip, Space, message } from "antd";
import {
  SendOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import "./ChatAgentModal.css";

const { TextArea } = Input;

interface ChatAgentModalProps {
  open: boolean;
  toggleChat: () => void;
}

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

const ChatAgentModal: React.FC<ChatAgentModalProps> = ({
  open,
  toggleChat,
}) => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleAsk = useCallback(async () => {
    if (!question) return;
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user" as const, text: question },
    ];
    setMessages(newMessages);

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
        setMessages([
          ...newMessages,
          { role: "agent" as const, text: response.data.output },
        ]);
        setQuestion("");
      } else {
        throw new Error(response.message || "Agent returned no data");
      }
    } catch (err: unknown) {
      messageApi.open({ type: "error", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [question, messages, messageApi]);

  const cancelAsk = useCallback(() => {
    setLoading(false);
    setQuestion("");
  }, []);

  return (
    <Drawer
      className="chat-drawer"
      title="Database Assistant"
      placement="right"
      width={600}
      closable={false}
      open={open}
      extra={
        <Space>
          <Tooltip title="Close">
            <CloseCircleOutlined
              onClick={toggleChat}
              className="chat-close-icon"
            />
          </Tooltip>
        </Space>
      }
    >
      {contextHolder}

      <div className="chat-messages-wrap">
        <List
          dataSource={messages}
          renderItem={(msg, idx) => (
            <List.Item key={idx} className={`chat-msg ${msg.role}`}>
              <div className="chat-msg-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </List.Item>
          )}
        />
      </div>

      <div className="chat-input-area">
        <TextArea
          className="chat-textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the database..."
          autoSize={{ minRows: 2, maxRows: 4 }}
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
    </Drawer>
  );
};

export default ChatAgentModal;

import { useState } from "react";
import { Drawer, Input, List, Tooltip, Typography, Space, message } from "antd";
import {
  SendOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;
const { TextArea } = Input;

const ChatAgentModal = ({
  open,
  toggleChat,
}: {
  open: boolean;
  toggleChat: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    []
  );

  const handleAsk = async () => {
    try {
      if (!question) return;

      setLoading(true);
      const newMessages = [...messages, { role: "user", text: question }];
      setMessages(newMessages);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/ask-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const response = await res.json();
      if (response) {
        if (response.error) {
          messageApi.open({
            type: "error",
            content: response.error,
          });
          return;
        }

        if (response.data) {
          // messageApi.open({
          //   type: "success",
          //   content: response.message || "Agent flow execution failed",
          // });
          const { data } = response;
          setMessages([...newMessages, { role: "agent", text: data.output }]);
          setQuestion("");
        } else {
          messageApi.open({
            type: "error",
            content: "Failed to generate database schema and documentation",
          });
        }
      } else {
        messageApi.open({
          type: "error",
          content: "Failed to generate database schema and documentation",
        });
      }
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message,
      });
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };

  const cancelAsk = () => {
    setLoading(false);
    setMessages([...messages]);
    setQuestion("");
  };

  return (
    <>
      <Drawer
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
                style={{ fontSize: 25, color: "#888" }}
              />
            </Tooltip>
          </Space>
        }
        styles={{
          body: { display: "flex", flexDirection: "column", padding: 0 },
        }}
      >
        {contextHolder}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <List
            dataSource={messages}
            renderItem={(msg, idx) => (
              <List.Item
                style={{
                  background: msg.role === "user" ? "#e6f7ff" : "#f6ffed",
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 10,
                }}
                key={idx}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text strong>{msg.role === "user" ? "You" : "Agent"}:</Text>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #f0f0f0",
            position: "relative",
          }}
        >
          <TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about the database..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            style={{ paddingRight: 40 }}
          />
          <Tooltip title="Send">
            {!loading && (
              <SendOutlined
                onClick={handleAsk}
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: 15,
                  fontSize: 20,
                  color: question ? "#000000" : "#ccc",
                  cursor: question ? "pointer" : "not-allowed",
                }}
              />
            )}
          </Tooltip>
          <Tooltip title="Stop">
            {loading && (
              <LoadingOutlined
                onClick={cancelAsk}
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: 15,
                  fontSize: 20,
                  color: question ? "#000000" : "#ccc",
                  cursor: question ? "pointer" : "not-allowed",
                }}
              />
            )}
          </Tooltip>
        </div>
      </Drawer>
    </>
  );
};

export default ChatAgentModal;

import { useEffect, useState } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Tabs,
  Row,
  Col,
  Typography,
  Select,
  Spin,
  Empty,
  message,
  Radio,
} from "antd";
import {
  SearchOutlined,
  ThunderboltOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import mermaid from "mermaid";
import ReactMarkdown from "react-markdown";
import "./App.css";
import ChatAgentModal from "./components/ChatAgentModal";
import type { TabsProps } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

mermaid.initialize({ startOnLoad: true });

const App: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isZoomed, setIsZoomed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [diagram, setDiagram] = useState("");
  const [doc, setDoc] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedDatabases = localStorage.getItem("databases");
    if (storedDatabases) {
      setDatabases(JSON.parse(storedDatabases));
    }

    const storedDatabase = localStorage.getItem("database");
    if (storedDatabase) {
      setSelected(storedDatabase);
    }

    const storedDoc = localStorage.getItem("dbSchemaDoc");
    if (storedDoc) {
      const { documentation, mermaid } = JSON.parse(storedDoc);
      setDiagram(mermaid);
      setDoc(documentation);
    }
  }, []);

  useEffect(() => {
    if (databases.length === 0) {
      localStorage.removeItem("dbSchemaDoc");
      localStorage.removeItem("databases");
      localStorage.removeItem("database");

      setDiagram("");
      setDoc("");
      setSelected("");
    }
  }, [databases]);

  const onFinish = async (values: Record<string, string | number>) => {
    setLoading(true);
    setDiagram("");
    setDoc("");
    try {
      const { database, host, port, user, password } = values;

      const config = {
        client: database,
        connection: {
          host,
          port,
          user,
          password,
        },
      };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/list-databases/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );

      const response = await res.json();
      if (response) {
        if (response.error) {
          messageApi.open({
            type: "error",
            content: response.error,
          });
          return;
        }
        if (response.data && response.data.length > 0) {
          messageApi.open({
            type: "success",
            content: response.message || "Databases fetched successfully",
          });
          localStorage.setItem("databases", JSON.stringify(response.data));
          setDatabases(response.data);
        }
      } else {
        messageApi.open({
          type: "error",
          content: "Failed to list databases",
        });
      }
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDatabase = async (value: string) => {
    setSelected(value);
    setLoading(true);
    setDiagram("");
    setDoc("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/generate-schema-doc/${value}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await res.json();
      if (response) {
        if (response.error) {
          messageApi.open({
            type: "error",
            content: response.error,
          });
          if (response.error.includes("connection expired")) {
            setDatabases([]);
          }
          return;
        }
        const newDbObj = {
          mermaid: "",
          title: "",
          documentation: "",
        };

        if (response.data) {
          const { data } = response;
          if (data.mermaid) {
            const { svg } = await mermaid.render(
              "generatedDiagram",
              data.mermaid
            );
            newDbObj.mermaid = svg;
            setDiagram(svg);
          }
          if (data.documentation) {
            newDbObj.documentation = data.documentation;
            setDoc(data.documentation);
          }

          messageApi.open({
            type: "success",
            content:
              response.message ||
              "Database schema and documentation generated successfully",
          });
          localStorage.setItem("database", value);
          localStorage.setItem("dbSchemaDoc", JSON.stringify(newDbObj));
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
      setLoading(false);
    }
  };

  const toggleChat = () => setOpen(!open);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ER-Diagram",
      children: (
        <div className="scrollable-box er-diagram-container">
          {diagram && (
            <>
              <div className="diagram-controls">
                <Button
                  type="text"
                  icon={isZoomed ? <ZoomOutOutlined /> : <SearchOutlined />}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
              <div
                className={`diagram-content ${isZoomed ? "zoomed" : ""}`}
                dangerouslySetInnerHTML={{ __html: diagram }}
              />
            </>
          )}
          {!diagram && <Empty description="No ER-Diagram available" />}
        </div>
      ),
    },
    {
      key: "2",
      label: "Documentation",
      children: (
        <div className="scrollable-box">
          {doc && <ReactMarkdown>{doc}</ReactMarkdown>}
          {!doc && <Empty description="No Documentation available" />}
        </div>
      ),
    },
  ];

  return (
    <Layout className="layout">
      <Header className="navbar">
        <ThunderboltOutlined className="logo-icon" />
        <Title level={3} className="navbar-title">
          Diagram and Documentation Visualizer
        </Title>
      </Header>

      <Content className="main-content">
        {contextHolder}
        {loading && (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        )}
        <Row gutter={16} className="full-height">
          <Col span={6}>
            {databases.length === 0 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="form-container"
              >
                <Form.Item
                  label="Database Type"
                  name="database"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select database type">
                    <Select.Option value="mysql2">MySQL</Select.Option>
                    <Select.Option value="pg">Postgres</Select.Option>
                    {/* <Select.Option value="mongodb">MongoDB</Select.Option>
                  <Select.Option value="sqlite">SQLite</Select.Option>
                  <Select.Option value="mssql">
                    Microsoft SQL Server
                  </Select.Option> */}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Host"
                  name="host"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter host address" />
                </Form.Item>

                <Form.Item
                  label="Port"
                  name="port"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter port number" type="number" />
                </Form.Item>

                <Form.Item
                  label="User"
                  name="user"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter username" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item className="form-submit">
                  <Button type="primary" htmlType="submit" disabled={loading}>
                    {loading ? "Connecting..." : "Connect"}
                  </Button>
                </Form.Item>
              </Form>
            )}
            {databases.length > 0 && (
              <div className="database-list">
                <h2 className="mb-2">Select Database: </h2>

                <Radio.Group
                  value={selected}
                  onChange={(e) => handleSelectDatabase(e.target.value)}
                  className="radio-button-list"
                >
                  {databases.map((db) => (
                    <Radio key={db} value={db} className="custom-radio">
                      {db}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
            )}
          </Col>

          {!loading && (
            <Col span={18}>
              <div className="results-container">
                <Tabs defaultActiveKey="1" items={items} />
                {diagram && doc && (
                  <Button
                    type="primary"
                    style={{ position: "fixed", top: 20, right: 20 }}
                    onClick={toggleChat}
                  >
                    Ask
                  </Button>
                )}
              </div>
            </Col>
          )}
        </Row>
        {open && <ChatAgentModal open={open} toggleChat={toggleChat} />}
      </Content>
    </Layout>
  );
};

export default App;

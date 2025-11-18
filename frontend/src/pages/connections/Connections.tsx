import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Drawer,
  message,
  Space,
  Tooltip,
} from "antd";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import mermaid from "mermaid";
import ConnectionForm from "../../components/connection-form/ConnectionForm";
import "./Connections.css";
import DatabaseList from "../../components/database/DatabaseList";
import ResultsView from "../results/ResultsView";

type Connection = {
  id: number;
  name: string;
  type: string;
  recentDatabase: string;
  lastConnected: string;
};

const connectionsList: Connection[] = [
  {
    id: 1,
    name: "Local PostgreSQL",
    type: "PostgreSQL",
    recentDatabase: "CustomerDB",
    lastConnected: "2025-11-08 12:34 PM",
  },
  {
    id: 2,
    name: "Remote MySQL",
    type: "MySQL",
    recentDatabase: "OrdersDB",
    lastConnected: "2025-11-08 10:12 AM",
  },
  {
    id: 3,
    name: "AWS RDS",
    type: "PostgreSQL",
    recentDatabase: "AnalyticsDB",
    lastConnected: "2025-11-07 08:45 PM",
  },
  {
    id: 4,
    name: "Azure SQL DB",
    type: "MSSQL",
    recentDatabase: "ReportingDB",
    lastConnected: "2025-11-06 09:00 AM",
  },
];

const { Title, Text } = Typography;

const Connections: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [diagram, setDiagram] = useState<string>("");
  const [doc, setDoc] = useState<string>("");
  const [selected, setSelected] = useState<string>("");

  const openNewConnection = () => setDrawerOpen(true);
  const closeNewConnection = () => setDrawerOpen(false);

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

  const handleConnection = useCallback(
    async (values: Record<string, string | number>) => {
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
          `${import.meta.env.VITE_API_URL}/db/list-databases/`,
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
    },
    [messageApi]
  );

  const handleSelectDatabase = useCallback(
    async (value: string) => {
      setSelected(value);
      setLoading(true);
      setDiagram("");
      setDoc("");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/db/generate-schema-doc/${value}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const response = await res.json();
        if (!response) throw new Error("Empty response from server");
        if (response.error) {
          messageApi.open({ type: "error", content: response.error });
          if (response.error.includes("connection expired")) {
            setDatabases([]);
          }
          return;
        }

        const newDbObj = { mermaid: "", title: "", documentation: "" };

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
          setDrawerOpen(false);
        } else {
          messageApi.open({
            type: "error",
            content: "Failed to generate database schema and documentation",
          });
        }
      } catch (err: unknown) {
        messageApi.open({ type: "error", content: (err as Error).message });
      } finally {
        setLoading(false);
      }
    },
    [messageApi]
  );

  const handleRemoveConnection = (connection: Connection) => {
    console.log("Remove db connection:", connection);
  };

  const handleShowDatabases = (connection: Connection) => {
    console.log("Show databases for connection:", connection);
  };

  if (diagram && doc) {
    return <ResultsView diagram={diagram} doc={doc} />;
  }

  return (
    <>
      {contextHolder}
      <Row className="dashboard-header" justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Connections
          </Title>
        </Col>
        <Col>
          <Button type="primary" onClick={openNewConnection}>
            Add Connection
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {connectionsList.map((connection) => (
          <Col key={connection.id} xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card className="db-card">
              <div>
                <Title level={4} className="db-title">
                  {connection.name}
                </Title>
                <Text type="secondary" className="db-last">
                  Type: <strong>{connection.type}</strong>
                </Text>
                <Text type="secondary" className="db-last">
                  Recent Database: <strong>{connection.recentDatabase}</strong>
                </Text>
                <Text type="secondary" className="db-last">
                  Last connected: <strong>{connection.lastConnected}</strong>
                </Text>
              </div>

              <div className="db-actions">
                <Tooltip title="Delete Connection">
                  <Button
                    type="primary"
                    onClick={() => handleRemoveConnection(connection)}
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
                <Tooltip title="Show Databases">
                  <Button
                    type="primary"
                    onClick={() => handleShowDatabases(connection)}
                    icon={<DoubleRightOutlined />}
                  />
                </Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title={databases.length > 0 ? "Select Database" : "New Connection"}
        placement="right"
        width={420}
        closable={false}
        open={drawerOpen}
        destroyOnClose
        extra={
          <Space>
            <Tooltip title="Close">
              <CloseCircleOutlined
                onClick={closeNewConnection}
                className="chat-close-icon"
              />
            </Tooltip>
          </Space>
        }
      >
        {databases.length === 0 ? (
          <ConnectionForm onFinish={handleConnection} loading={loading} />
        ) : (
          <DatabaseList
            databases={databases}
            selected={selected}
            onSelect={(v) => void handleSelectDatabase(v)}
          />
        )}
      </Drawer>
    </>
  );
};

export default Connections;

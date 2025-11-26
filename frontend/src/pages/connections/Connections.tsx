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
  Empty,
  Popconfirm,
  Spin,
} from "antd";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DoubleRightOutlined,
  EditOutlined,
} from "@ant-design/icons";
import ConnectionForm from "../../components/connection-form/ConnectionForm";
import "./Connections.css";
import DatabaseList from "../../components/database/DatabaseList";
import type { Connection, ConnectionPayload } from "../../types/connection";
import { fetchConnections, removeConnection } from "../../api/connection";
import { listDatabases, updateConnection, createDatabase } from "../../api/db";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Connections: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [connectionsList, setConnectionList] = useState<Connection[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null
  );
  const [currentConnectionId, setCurrentConnectionId] = useState<string>("");

  const openNewConnection = () => setDrawerOpen(true);
  const closeNewConnection = () => {
    setDatabases([]);
    setSelected("");
    setCurrentConnectionId("");
    setDrawerOpen(false);
  };

  const navigate = useNavigate();

  const handleConnection = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const {
        name,
        database,
        host,
        port,
        user,
        password,
        restrictConnection = "false",
      } = values;

      const config: ConnectionPayload = {
        client: database,
        connection: {
          name,
          host,
          port: Number(port),
          user,
          password,
        },
        restrictConnection,
      };

      if (editingConnection) {
        // Update existing connection
        const { response, message } = await updateConnection(
          editingConnection.id,
          config
        );
        messageApi.open({
          type: "success",
          content: message || "Connection updated successfully",
        });

        setConnectionList((prev) =>
          prev.map((p) => (p.id === response.id ? { ...p, ...response } : p))
        );
        setEditingConnection(null);
        setDrawerOpen(false);
      } else {
        // Create new connection
        const { response, message } = await listDatabases(config);
        messageApi.open({
          type: "success",
          content: message || "Databases fetched successfully",
        });
        setDatabases(response.databases);
        if (response.connections) {
          setConnectionList((prev) => [...prev, response.connections]);
          setCurrentConnectionId(response.connections.id);
        }
        setDrawerOpen(true);
      }
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content:
          (err as Error).message ||
          (editingConnection
            ? "Failed to update connection"
            : "Failed to list databases"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDatabase = async (value: string) => {
    if (!currentConnectionId) {
      messageApi.open({
        type: "error",
        content: "No connection selected",
      });
      return;
    }
    setSelected(value);
    setLoading(true);
    try {
      await createDatabase(currentConnectionId, value);
      messageApi.open({
        type: "success",
        content: "Database created successfully",
      });
      // Close the drawer or navigate to databases page
      closeNewConnection();
      navigate("/databases");
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to create database",
      });
    } finally {
      setLoading(false);
    }
  };

  const listConnections = useCallback(async () => {
    try {
      setLoading(true);
      const connections = await fetchConnections();
      setConnectionList(connections);
    } catch (err) {
      messageApi.open({ type: "error", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    listConnections();
  }, [listConnections]);

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setDrawerOpen(true);
  };

  const handleRemoveConnection = async (connection: Connection) => {
    try {
      const { message } = await removeConnection(connection.id);
      messageApi.open({
        type: "success",
        content: message || "Connection removed successfully",
      });
      setConnectionList((prev) => prev.filter((p) => p.id !== connection.id));
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to remove connection",
      });
    }
  };

  const handleShowDatabases = async (connection: Connection) => {
    const { id, name, db_type, host, port, db_user, db_password } = connection;
    setCurrentConnectionId(id);
    handleConnection({
      name,
      database: db_type,
      host,
      port: port.toString(),
      user: db_user,
      password: db_password,
      restrictConnection: "true",
    });
  };

  return (
    <>
      {contextHolder}
      <Spin spinning={loading}>
        <Row
          className="dashboard-header"
          justify="space-between"
          align="middle"
        >
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

        {connectionsList.length === 0 ? (
          <Row justify="center">
            <Empty description="No connections available" />
          </Row>
        ) : (
          <Row gutter={[16, 16]} justify="start">
            {connectionsList.map((connection) => (
              <Col key={connection.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card className="db-card">
                  <div>
                    <Title level={4} className="db-title">
                      {connection.name}
                    </Title>
                    <Text type="secondary" className="db-last">
                      Type: <strong>{connection.db_type}</strong>
                    </Text>
                    <Text type="secondary" className="db-last">
                      Recent Database:{" "}
                      <strong>{connection.databases?.name || "Nill"}</strong>
                    </Text>
                    <Text type="secondary" className="db-last">
                      Last connected:{" "}
                      <strong>{connection.lastConnected || "Nill"}</strong>
                    </Text>
                  </div>

                  <div className="db-actions">
                    <Tooltip title="Delete Connection">
                      <Popconfirm
                        title="Delete the Connection"
                        description="Are you sure to delete this connection?"
                        onConfirm={() => handleRemoveConnection(connection)}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Edit Connection">
                      <Button
                        type="primary"
                        onClick={() => handleEditConnection(connection)}
                        icon={<EditOutlined />}
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
        )}

        <Drawer
          title={
            databases.length > 0
              ? "Select Database"
              : editingConnection
              ? "Edit Connection"
              : "New Connection"
          }
          placement="right"
          width={420}
          closable={false}
          open={drawerOpen}
          destroyOnClose
          extra={
            <Space>
              <Tooltip title="Close">
                <CloseCircleOutlined
                  onClick={() => {
                    setEditingConnection(null);
                    closeNewConnection();
                  }}
                  className="chat-close-icon"
                />
              </Tooltip>
            </Space>
          }
        >
          {databases.length === 0 && (
            <ConnectionForm
              onFinish={handleConnection}
              loading={loading}
              initialValues={
                editingConnection
                  ? {
                      name: editingConnection.name,
                      database: editingConnection.db_type,
                      host: editingConnection.host,
                      port: editingConnection.port.toString(),
                      user: editingConnection.db_user,
                    }
                  : undefined
              }
              isEdit={!!editingConnection}
            />
          )}
          {databases.length > 0 && (
            <DatabaseList
              databases={databases}
              selected={selected}
              onSelect={(v) => handleCreateDatabase(v)}
            />
          )}
        </Drawer>
      </Spin>
    </>
  );
};

export default Connections;

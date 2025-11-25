import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  message,
  Tooltip,
  Spin,
  Empty,
  Popconfirm,
} from "antd";
import { DeleteOutlined, DoubleRightOutlined } from "@ant-design/icons";
import "./Databases.css";
import { listSelectedDatabases, deleteDatabase } from "../../api/db";

type Database = {
  id: string;
  connection_id: string;
  name: string;
  questions: string[];
  connections: {
    id: string;
    name: string;
  };
};

const { Title, Text } = Typography;

const Databases: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<Database[]>([]);

  const fetchDatabases = useCallback(async () => {
    try {
      setLoading(true);
      const { response } = await listSelectedDatabases();
      setDatabases(response);
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to fetch databases",
      });
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleRemoveDatabase = async (database: Database) => {
    try {
      setLoading(true);
      const { message } = await deleteDatabase(database.id);
      messageApi.open({
        type: "success",
        content: message || "Database removed successfully",
      });

      setDatabases((prev) => prev.filter((p) => p.id !== database.id));
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to remove database",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDatabase = useCallback((database: Database) => {
    console.log("Selected database:", database);
  }, []);

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
              Databases
            </Title>
          </Col>
        </Row>

        {databases.length === 0 ? (
          <Row justify="center">
            <Empty description="No databases available" />
          </Row>
        ) : (
          <Row gutter={[16, 16]} justify="start">
            {databases.map((database) => (
              <Col key={database.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card className="db-card">
                  <div>
                    <Title level={4} className="db-title">
                      {database.name}
                    </Title>
                    <Text type="secondary" className="db-last">
                      Connection Name:
                      <strong>{database.connections.name}</strong>
                    </Text>
                    <Title level={5} className="db-title">
                      Last 3 questions
                    </Title>
                    {database.questions.length === 0 && (
                      <Text type="secondary" className="db-last">
                        No Questions Available
                      </Text>
                    )}
                    {database.questions.length > 0 &&
                      database.questions.map((question, index) => (
                        <Text key={index} type="secondary" className="db-last">
                          - {question}
                        </Text>
                      ))}
                  </div>

                  <div className="db-actions">
                    <Tooltip title="Remove Database">
                      <Popconfirm
                        title="Delete the Database"
                        description="Are you sure to delete this database?"
                        onConfirm={() => handleRemoveDatabase(database)}
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
                    <Tooltip title="Select Database">
                      <Button
                        type="primary"
                        onClick={() => handleSelectDatabase(database)}
                        icon={<DoubleRightOutlined />}
                      />
                    </Tooltip>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </>
  );
};

export default Databases;

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  DeleteOutlined,
  BulbOutlined,
  FundViewOutlined,
} from "@ant-design/icons";
import "./Databases.css";
import { listSelectedDatabases, deleteDatabase } from "../../api/db";
import { generateInsights, viewInsights } from "../../api/agent";
import { formatDuration } from "../../utils/util";
import mermaid from "mermaid";

export type Database = {
  id: string;
  name: string;
  connections: {
    id: string;
    name: string;
  };
  insights_status: string;
  insights_gen_count: number;
  insights_gen_time: number;
};

const { Title, Text } = Typography;

const Databases: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [insights, setInsights] = useState();

  const navigate = useNavigate();

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

  const handleGenerateInsights = async (database: Database) => {
    try {
      setLoading(true);
      const { message } = await generateInsights(database);
      messageApi.open({
        type: "success",
        content: message || "Insights generated successfully",
      });
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to generate insights",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsights = async (database: Database) => {
    try {
      setLoading(true);
      const { response, message } = await viewInsights(database.id);
      messageApi.open({
        type: "success",
        content: message || "Viewing insights",
      });

      const insights = response.insights_data;

      const { svg } = await mermaid.render("erDiagram", insights.mermaid);
      const updatedInsights = { ...insights, mermaid: svg };
      const newResponse = { ...response, insights_data: updatedInsights };
      setInsights({ ...response, insights_data: newResponse });
      navigate("/insights", { state: { insights: newResponse } });
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Failed to view insights",
      });
    } finally {
      setLoading(false);
    }
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
                      Connection: <strong>{database.connections.name}</strong>
                    </Text>
                    <Text type="secondary" className="db-last">
                      Insights Status:{" "}
                      <strong>{database.insights_status || "Nill"}</strong>
                    </Text>
                    <Text type="secondary" className="db-last">
                      Insights Generated Count:{" "}
                      <strong>{database.insights_gen_count || "Nill"}</strong>
                    </Text>
                    <Text type="secondary" className="db-last">
                      Prev. Insights Generation Time:{" "}
                      <strong>
                        {(database.insights_gen_time &&
                          formatDuration(database.insights_gen_time)) ||
                          "Nill"}
                      </strong>
                    </Text>
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
                    <Tooltip title="Generate Insights">
                      <Button
                        type="primary"
                        onClick={() => handleGenerateInsights(database)}
                        icon={<BulbOutlined />}
                      />
                    </Tooltip>
                    {database.insights_gen_count && (
                      <Tooltip title="View Insights">
                        <Button
                          type="primary"
                          onClick={() => handleViewInsights(database)}
                          icon={<FundViewOutlined />}
                        />
                      </Tooltip>
                    )}
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

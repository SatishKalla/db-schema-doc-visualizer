import React, { useCallback, useState } from "react";
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
import "./Databases.css";
import DatabaseList from "../../components/database/DatabaseList";

type Database = {
  id: number;
  name: string;
  questions: string[];
};

const connectedDatabases: Database[] = [
  {
    id: 1,
    name: "Local PostgreSQL",
    questions: [
      "What is the schema of the database?",
      "List all tables in the database.",
      "Describe the relationships between tables.",
    ],
  },
  {
    id: 2,
    name: "Remote MySQL",
    questions: [
      "What is the schema of the database?",
      "List all tables in the database.",
      "Describe the relationships between tables.",
    ],
  },
  {
    id: 3,
    name: "AWS RDS",
    questions: [
      "What is the schema of the database?",
      "List all tables in the database.",
      "Describe the relationships between tables.",
    ],
  },
  {
    id: 4,
    name: "Azure SQL DB",
    questions: [
      "What is the schema of the database?",
      "List all tables in the database.",
      "Describe the relationships between tables.",
    ],
  },
];

const { Title, Text } = Typography;

const Connections: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  const openNewDatabase = () => setDrawerOpen(true);
  const closeNewDatabase = () => setDrawerOpen(false);

  const handleSelectDatabase = useCallback((database: Database) => {
    console.log("Selected database:", database);
    setSelected(database.name);
  }, []);

  const handleRemoveDatabase = (database: Database) => {
    console.log("Remove database");
    setSelected("");
  };

  return (
    <>
      {contextHolder}
      <Row className="dashboard-header" justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Databases
          </Title>
        </Col>
        <Col>
          <Button type="primary" onClick={openNewDatabase}>
            Add Database
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {connectedDatabases.map((database) => (
          <Col key={database.id} xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card className="db-card">
              <div>
                <Title level={4} className="db-title">
                  {database.name}
                </Title>
                <Title level={5} className="db-title">
                  Last 3 questions
                </Title>
                {database.questions.length > 0 &&
                  database.questions.map((question, index) => (
                    <Text key={index} type="secondary" className="db-last">
                      - {question}
                    </Text>
                  ))}
                {database.questions.length === 0 && (
                  <Text type="secondary" className="db-last">
                    No Questions Available
                  </Text>
                )}
              </div>

              <div className="db-actions">
                <Tooltip title="Remove Database">
                  <Button
                    type="primary"
                    onClick={() => handleRemoveDatabase(database)}
                    danger
                    icon={<DeleteOutlined />}
                  />
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

      <Drawer
        title={"Add Database"}
        placement="right"
        width={420}
        closable={false}
        open={drawerOpen}
        destroyOnClose
        extra={
          <Space>
            <Tooltip title="Close">
              <CloseCircleOutlined
                onClick={closeNewDatabase}
                className="chat-close-icon"
              />
            </Tooltip>
          </Space>
        }
      >
        <DatabaseList
          databases={databases}
          selected={selected}
          onSelect={(v) => void handleSelectDatabase(v)}
        />
      </Drawer>
    </>
  );
};

export default Connections;

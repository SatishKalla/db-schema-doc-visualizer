import React, { useMemo } from "react";
import { Tabs, Empty, Button, Row, Col, Typography, Table } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { TabsProps } from "antd";
import "./Insights.css";
import ChatAgentModal from "../../components/modals/chat-agent/ChatAgentModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Props {
  insights?: any;
}

const { Title } = Typography;

const Insights: React.FC<Props> = ({ insights: propInsights }) => {
  const location = useLocation();
  const insights = propInsights || location.state?.insights;
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);

  const { title, charts, tables, mermaid, documentation } =
    insights.insights_data;

  const chartElements = useMemo(() => {
    return charts.map((chart: any, index: number) => {
      const ChartComponent =
        chart.type === "bar"
          ? Bar
          : chart.type === "doughnut"
          ? Doughnut
          : Line;
      return (
        <div key={`chart-${index}`} className="chart-item">
          <ChartComponent data={chart.data} options={chart.options} />
        </div>
      );
    });
  }, [charts]);

  const toggleChat = () => {
    setOpen(!open);
  };

  const onAsk = () => {
    setOpen(true);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children: (
        <div className="scrollable-box">
          {!charts && !tables && <Empty description="No Overview available" />}

          {charts && charts.length > 0 && (
            <div className="charts-container">{chartElements}</div>
          )}

          {tables && tables.length > 0 && (
            <div className="tables-container">
              {tables.map((table: any, index: number) => (
                <div key={index} className="table-item">
                  <h3>{table.title}</h3>
                  <Table
                    columns={table.columns}
                    dataSource={table.data}
                    pagination={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: "ER-Diagram",
      children: (
        <div className="scrollable-box">
          {mermaid && (
            <>
              <div className="diagram-controls">
                {!isZoomed && (
                  <Button type="text" onClick={() => setIsZoomed(!isZoomed)}>
                    <ZoomInOutlined />
                  </Button>
                )}
                {isZoomed && (
                  <Button type="text" onClick={() => setIsZoomed(!isZoomed)}>
                    <ZoomOutOutlined />
                  </Button>
                )}
              </div>
              <div
                className={`diagram-content ${isZoomed ? "zoomed" : ""}`}
                dangerouslySetInnerHTML={{ __html: mermaid }}
              />
            </>
          )}
          {!mermaid && <Empty description="No ER-Diagram available" />}
        </div>
      ),
    },
    {
      key: "3",
      label: "Documentation",
      children: (
        <div className="scrollable-box">
          {documentation && <ReactMarkdown>{documentation}</ReactMarkdown>}
          {!documentation && <Empty description="No Documentation available" />}
        </div>
      ),
    },
  ];

  return (
    <>
      <Row className="dashboard-header" justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
        </Col>
      </Row>
      <Tabs defaultActiveKey="1" items={items} />
      {insights && (
        <Button type="primary" className="ask-button" onClick={onAsk}>
          Chat
        </Button>
      )}
      {open && <ChatAgentModal open={open} toggleChat={toggleChat} />}
    </>
  );
};

export default Insights;

import React, { useMemo } from "react";
import {
  Tabs,
  Empty,
  Button,
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Table,
  Progress,
  List,
  Tag,
  Tooltip,
} from "antd";
import {
  OpenAIOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import type { TabsProps } from "antd";
import "./Insights.css";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Props {
  insights?: {
    databaseId: string;
    databaseName: string;
    insights_data: IInsightsData;
  };
}

interface IMetric {
  value: number | string;
  percentage?: string;
  metric: string;
  description?: string;
  details?: string;
}

interface ICategory {
  column: string;
  categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

interface IChart {
  type: "bar" | "doughnut" | "line";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
}

interface ITextMetric {
  table: string;
  column: string;
  avg_length: number;
  max_length: number;
  null_percentage: number;
}

interface IInsight {
  issue?: string;
  anomaly?: string;
  recommendation?: string;
  risk?: string;
  signal?: string;
  description?: string;
  impact?: string;
  justification?: string;
  forecast?: string;
  current_rate?: string;
  type?: string;
  table?: string;
  column?: string;
  rows_affected?: number;
  severity?: Severity;
  trend?: Severity;
  metric?: string;
}

interface ITable {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export interface IInsightsData {
  title: string;
  mermaid?: string;
  documentation?: string;
  activity_metrics?: IMetric[];
  charts?: IChart[];
  tables?: ITable[];
  categorical_distribution?: ICategory[];
  anomalies?: IInsight[];
  data_quality?: IMetric[];
  design_issues?: IInsight[];
  recommendations?: IInsight[];
  security_privacy?: IInsight[];
  growth_metrics?: IInsight[];
  financial_metrics?: IMetric[];
  predictive_signals?: IInsight[];
  text_metrics?: ITextMetric[];
}

const { Title } = Typography;
type Severity = "none" | "Stable" | "low" | "medium" | "high" | "informational";

const Insights: React.FC<Props> = ({ insights: propInsights }) => {
  const location = useLocation();
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const insights = propInsights || location.state?.insights;

  const {
    title,
    mermaid,
    documentation,
    activity_metrics,
    charts,
    tables,
    categorical_distribution,
    anomalies,
    data_quality,
    design_issues,
    recommendations,
    security_privacy,
    growth_metrics,
    financial_metrics,
    predictive_signals,
    text_metrics,
  } = insights.insights_data;

  const severityColors: Record<Severity, string> = {
    none: "green",
    Stable: "green",
    informational: "skyblue",
    low: "gold",
    medium: "orange",
    high: "red",
  };

  const displayActivityMetrics = (data: IMetric[]) => {
    return (
      <Row gutter={16}>
        {data.map((m, index) => (
          <Col key={index} xs={24} sm={12} md={8} className="column">
            <Card className="metric-card">
              <div className="metric-title">{m.metric}</div>
              <Statistic
                value={m.value}
                suffix={m.percentage ? `(${m.percentage})` : ""}
                valueStyle={{ color: "#3f8600", fontSize: "32px" }}
              />
              {(m.description || m.details) && (
                <p className="metric-description">
                  {m.description || m.details}
                </p>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const chartElements = useMemo(() => {
    return charts.map((chart: IChart, index: number) => {
      const ChartComponent =
        chart.type === "bar"
          ? Bar
          : chart.type === "doughnut"
          ? Doughnut
          : Line;
      return (
        <div key={`chart-${index}`} className="chart-item">
          <Card>
            <ChartComponent
              data={chart.data}
              options={chart.options}
              height={300}
            />
          </Card>
        </div>
      );
    });
  }, [charts]);

  const displayCategorical = (data: ICategory[], title: string) => {
    return (
      <Card title={title}>
        {data.map((dist, idx) => (
          <div key={idx}>
            <div className="title">{dist.column}</div>
            {dist.categories.map((cat, i: number) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{cat.category}</span>
                  <span>
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <Progress percent={cat.percentage} showInfo={false} />
              </div>
            ))}
          </div>
        ))}
      </Card>
    );
  };

  const displayTextMetrics = (data: ITextMetric[], title: string) => {
    if (!data || data.length === 0)
      return <Empty description={`${title} not available`} />;

    const columns = [
      { title: "Table", dataIndex: "table", key: "table" },
      { title: "Column", dataIndex: "column", key: "column" },
      { title: "Avg Length", dataIndex: "avg_length", key: "avg_length" },
      { title: "Max Length", dataIndex: "max_length", key: "max_length" },
      {
        title: "Null Percentage",
        dataIndex: "null_percentage",
        key: "null_percentage",
      },
    ];
    return (
      <Card title={title}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
    );
  };

  const displayInsights = (data: IInsight[], title: string) => {
    return (
      <Card title={title}>
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              actions={
                (item.severity || item.trend) && [
                  <Tag
                    color={
                      severityColors[
                        (item.severity as Severity) || (item.trend as Severity)
                      ]
                    }
                  >
                    {item.severity || item.trend}
                  </Tag>,
                ]
              }
            >
              <List.Item.Meta
                title={
                  item.issue ||
                  item.anomaly ||
                  item.recommendation ||
                  item.risk ||
                  item.signal ||
                  item.metric
                }
                description={
                  item.description ||
                  item.impact ||
                  item.justification ||
                  (item.forecast &&
                    item.current_rate &&
                    `${item.forecast}. Current rate: ${item.current_rate}`) ||
                  `${item.type} - ${item.table}.${item.column} - ${item.rows_affected} rows affected`
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const handleAskDatabase = () => {
    navigate("/ask-database", { state: { insights } });
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Insights",
      children: (
        <div className="scrollable-box">
          <div className="active-metrics-insights">
            {activity_metrics &&
              activity_metrics.length > 0 &&
              displayActivityMetrics(activity_metrics)}
            {data_quality &&
              data_quality.length > 0 &&
              displayActivityMetrics(data_quality)}
            {financial_metrics &&
              financial_metrics.length > 0 &&
              displayActivityMetrics(financial_metrics)}
          </div>
          {charts && charts.length > 0 && (
            <div className="charts-container">{chartElements}</div>
          )}
          {tables && tables.length > 0 && (
            <div className="insights-data">
              {tables.map((table: ITable, index: number) => (
                <div key={index} className="table-item">
                  <Card title={table.title}>
                    <Table
                      columns={table.columns}
                      dataSource={table.data}
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  </Card>
                </div>
              ))}
            </div>
          )}
          <div className="text-metric-insights">
            {text_metrics &&
              text_metrics.length > 0 &&
              displayTextMetrics(text_metrics, "Text/JSON Metrics")}
          </div>
          <div className="categorical-insights">
            {categorical_distribution &&
              categorical_distribution.length > 0 &&
              displayCategorical(
                categorical_distribution,
                "Categorical Distribution"
              )}
          </div>
          <div className="insights-data">
            {predictive_signals &&
              predictive_signals.length > 0 &&
              displayInsights(predictive_signals, "Predictive Signals")}
            {anomalies &&
              anomalies.length > 0 &&
              displayInsights(anomalies, "Anomalies")}
            {design_issues &&
              design_issues.length > 0 &&
              displayInsights(design_issues, "Design Issues")}
            {growth_metrics &&
              growth_metrics.length > 0 &&
              displayInsights(growth_metrics, "Growth Metrics")}
            {security_privacy &&
              security_privacy.length > 0 &&
              displayInsights(
                security_privacy,
                "Security and Privacy Insights"
              )}
            {recommendations &&
              recommendations.length > 0 &&
              displayInsights(recommendations, "Recommendations")}
          </div>
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
          <Card>
            {documentation && <ReactMarkdown>{documentation}</ReactMarkdown>}
            {!documentation && (
              <Empty description="No Documentation available" />
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <>
      <Row className="dashboard-header" justify="space-between" align="middle">
        <Col className="header-title">
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
        </Col>
        <Col>
          {insights && (
            <Tooltip title="Ask Database">
              <OpenAIOutlined
                onClick={handleAskDatabase}
                style={{ fontSize: "30px" }}
              />
            </Tooltip>
          )}
        </Col>
      </Row>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  );
};

export default Insights;

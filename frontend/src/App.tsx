import { useState } from "react";
import {
  Layout,
  Typography,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Divider,
} from "antd";
import mermaid from "mermaid";
import ReactMarkdown from "react-markdown";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

mermaid.initialize({ startOnLoad: true });

export default function App() {
  const [schemaText, setSchemaText] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagram, setDiagram] = useState("");
  const [doc, setDoc] = useState("");

  async function handleGenerate() {
    if (!schemaText.trim()) {
      return;
    }
    setLoading(true);
    setDiagram("");
    setDoc("");

    try {
      const res = await fetch(
        "http://localhost:3000/main-routes/generate-schema-doc",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemaText }),
        }
      );

      const data = await res.json();

      if (data.mermaid) {
        const { svg } = await mermaid.render("generatedDiagram", data.mermaid);
        setDiagram(svg);
      }
      if (data.documentation) {
        setDoc(data.documentation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">DB Schema Doc Visualizer</Header>

      <Content className="app-content">
        <div className="schema-input">
          <Title level={3}>Enter Schema Text</Title>
          <TextArea
            rows={8}
            placeholder="Paste your schema text here..."
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
          />
          <br />
          <Button
            type="primary"
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>

          {loading && (
            <div className="loading-spinner">
              <Spin size="large" />
            </div>
          )}
        </div>
        <hr />
        <div className="result-container">
          {!loading && (diagram || doc) && (
            <Row gutter={20} className="result-row">
              {diagram && (
                <Col span={12}>
                  <Divider orientation="left">Diagram</Divider>
                  <div dangerouslySetInnerHTML={{ __html: diagram }} />
                </Col>
              )}
              {doc && (
                <Col span={12}>
                  <Divider orientation="left">Documentation</Divider>
                  <ReactMarkdown>{doc}</ReactMarkdown>
                </Col>
              )}
            </Row>
          )}
        </div>
      </Content>

      <Footer className="app-footer">
        DB Schema Doc Visualizer © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

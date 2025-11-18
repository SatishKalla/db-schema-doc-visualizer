import React, { useEffect } from "react";
import { Tabs, Empty, Button } from "antd";
import ReactMarkdown from "react-markdown";
import type { TabsProps } from "antd";
import "./ResultsView.css";
import ChatAgentModal from "../../components/modals/chat-agent/ChatAgentModal";

interface Props {
  diagram: string;
  doc: string;
}

const ResultsView: React.FC<Props> = ({ diagram, doc }) => {
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);

  const toggleChat = () => {
    setOpen(!open);
  };

  const onAsk = () => {
    setOpen(true);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ER-Diagram",
      children: (
        <div className="scrollable-box er-diagram-container">
          {diagram && (
            <>
              <div className="diagram-controls">
                <Button type="text" onClick={() => setIsZoomed(!isZoomed)}>
                  {isZoomed ? "Zoom Out" : "Zoom In"}
                </Button>
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
    <div className="results-container">
      <Tabs defaultActiveKey="1" items={items} />
      {diagram && doc && (
        <Button type="primary" className="ask-button" onClick={onAsk}>
          Chat
        </Button>
      )}
      {open && <ChatAgentModal open={open} toggleChat={toggleChat} />}
    </div>
  );
};

export default ResultsView;

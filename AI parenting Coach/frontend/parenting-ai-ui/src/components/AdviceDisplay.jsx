import { Card } from "antd";
import ReactMarkdown from "react-markdown";

const AdviceDisplay = ({ advice }) => {
  return (
    <Card
      title="Parenting Advice"
      className="advice-box"
      style={{ marginTop: "20px" }}
    >
      <ReactMarkdown>
        {advice || "Your advice will appear here..."}
      </ReactMarkdown>
    </Card>
  );
};

export default AdviceDisplay;

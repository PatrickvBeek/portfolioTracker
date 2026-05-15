import { newPortfolioFromName } from "pt-domain";
import { useState } from "react";
import { useAddPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { styles } from "./PortfolioInputForm.styles";

const PortfolioInputForm = ({ onConfirm }: { onConfirm?: () => void }) => {
  const [fieldContent, setFieldContent] = useState("");
  const addPortfolio = useAddPortfolio();

  const handleSubmit = () => {
    if (fieldContent) {
      addPortfolio(newPortfolioFromName(fieldContent));
    }
    setFieldContent("");
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className={styles.container}>
      <Input
        value={fieldContent}
        onChange={(e) => setFieldContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && fieldContent.length > 0) {
            handleSubmit();
          }
        }}
        placeholder={"New Portfolio Name..."}
        label={"Name"}
        autoFocus={true}
      />
      <Button
        intent="primary"
        disabled={fieldContent.length === 0}
        onClick={handleSubmit}
      >
        {"Add"}
      </Button>
    </div>
  );
};

export default PortfolioInputForm;

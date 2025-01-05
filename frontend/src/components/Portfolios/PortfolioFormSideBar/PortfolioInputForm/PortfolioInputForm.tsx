import { newPortfolioFromName } from "pt-domain/src/portfolio/portfolio.operations";
import { useState } from "react";
import { useAddPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { Button } from "../../../general/Button";
import { TextInput } from "../../../general/TextInput";
import "./PortfolioInputForm.css";

const { bemElement, bemBlock } = bemHelper("portfolio-input-form");

const PortfolioInputForm = ({ onConfirm }: { onConfirm?: () => void }) => {
  const [fieldContent, setFieldContent] = useState("");
  const addPortfolio = useAddPortfolio();
  return (
    <div className={bemBlock(undefined)}>
      <TextInput
        text={fieldContent}
        onChange={(element) => setFieldContent(element.target.value)}
        placeholder={"New Portfolio Name..."}
        label={"Name"}
        className={bemElement("input-field")}
        autoFocus={true}
      />
      <Button
        className={bemElement("add-button")}
        onClick={() => {
          fieldContent && addPortfolio(newPortfolioFromName(fieldContent));
          setFieldContent("");
          onConfirm && onConfirm();
        }}
        label={"Add"}
        isDisabled={fieldContent.length === 0}
        isPrimary={true}
      />
    </div>
  );
};

export default PortfolioInputForm;

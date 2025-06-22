import { Stack } from "@mui/material";
import { newPortfolioFromName } from "pt-domain";
import { useState } from "react";
import { useAddPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { Button } from "../../../general/Button";
import { TextInput } from "../../../general/TextInput";

const PortfolioInputForm = ({ onConfirm }: { onConfirm?: () => void }) => {
  const [fieldContent, setFieldContent] = useState("");
  const addPortfolio = useAddPortfolio();
  return (
    <Stack direction={"row"} spacing={1} alignItems={"flex-start"}>
      <TextInput
        text={fieldContent}
        onChange={(element) => setFieldContent(element.target.value)}
        placeholder={"New Portfolio Name..."}
        label={"Name"}
        autoFocus={true}
      />
      <div>
        <Button
          sx={{
            marginTop: "1.25rem",
          }}
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
    </Stack>
  );
};

export default PortfolioInputForm;

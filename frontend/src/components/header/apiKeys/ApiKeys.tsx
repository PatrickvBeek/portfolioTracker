import { Tooltip } from "@mui/material";
import { FC } from "react";
import ApiKeysOverlay from "./ApiKeysOverlay";
import { useApiKeysManager } from "./useApiKeysManager";

export const ApiKeys: FC = () => {
  const {
    isOverlayOpen,
    yahooKey,
    setYahooKey,
    openApiKeys,
    closeApiKeys,
    handleSubmit,
  } = useApiKeysManager();

  return (
    <div className={"styles.container"}>
      <Tooltip title="Mange API keys">
        <i
          className="fa-solid fa-key"
          style={{ color: "white" }}
          onClick={openApiKeys}
        />
      </Tooltip>
      <ApiKeysOverlay
        open={isOverlayOpen}
        onClose={closeApiKeys}
        yahooKey={yahooKey}
        onYahooKeyChange={setYahooKey}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

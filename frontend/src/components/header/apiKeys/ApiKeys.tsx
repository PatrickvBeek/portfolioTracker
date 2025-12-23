import { IconButton, Tooltip } from "@mui/material";
import { FC } from "react";
import { StyledIcon } from "../../general/StyledComponents";
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
      <Tooltip title="Manage API keys">
        <IconButton onClick={openApiKeys}>
          <StyledIcon className="fa-solid fa-key" />
        </IconButton>
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

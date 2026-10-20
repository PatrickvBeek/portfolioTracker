import { FC } from "react";
import { KeyRound } from "lucide-react";
import { Tooltip } from "../../ui/Tooltip";
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
    <div>
      <Tooltip content="Manage API keys" side="bottom">
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-text-muted hover:text-text hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
          onClick={openApiKeys}
          aria-label="Manage API keys"
        >
          <KeyRound size={18} />
        </button>
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

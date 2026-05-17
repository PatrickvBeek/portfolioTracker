import React from "react";
import { Button } from "../../ui/Button";
import { Dialog } from "../../ui/Dialog";
import { Input } from "../../ui/Input";

interface ApiKeysOverlayProps {
  open: boolean;
  onClose: () => void;
  yahooKey: string;
  onYahooKeyChange: (value: string) => void;
  onSubmit: () => void;
}

const ApiKeysOverlay: React.FC<ApiKeysOverlayProps> = ({
  open,
  onClose,
  yahooKey,
  onYahooKeyChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose} title="Manage API Keys">
      <div className="flex flex-col max-w-[30em]">
        <Input
          label="Yahoo Finance API Key"
          value={yahooKey}
          onChange={(e) => onYahooKeyChange(e.target.value)}
        />
        <div className="my-4 text-sm">
          <div className="mb-2">
            You can get a free API key from{" "}
            <a
              href="https://financeapi.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              financeapi.net
            </a>
          </div>
          <div className="text-text-muted">
            With YH API access the app provides more fine granular price updates
            and higher request limits. Otherwise it will try to use AlphaVantage
            as a fallback with only weekly prices information and throttled
            request rate.
          </div>
        </div>
        <Button intent="primary" onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </Dialog>
  );
};

export default ApiKeysOverlay;

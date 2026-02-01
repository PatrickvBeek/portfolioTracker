import React from "react";
import { Button } from "../../general/Button";
import Overlay from "../../general/Overlay/Overlay";
import { TextInput } from "../../general/TextInput";
import styles from "./ApiKeysOverlay.module.less";

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
    <Overlay open={open} onClose={onClose} title={"Manage API Keys"}>
      <div className={styles.form}>
        <TextInput
          label={"Yahoo Finance API Key"}
          text={yahooKey}
          onChange={(e) => onYahooKeyChange(e.target.value)}
        />
        <div className={styles.info}>
          <div className={styles.infoText}>
            You can get a free API key from{" "}
            <a
              href="https://financeapi.net"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              financeapi.net
            </a>
          </div>
          <div className={styles.benefit}>
            With YH API access the app provides more fine granular price updates
            and higher request limits. Otherwise it will try to use AlphaVantage
            as a fallback with only weekly prices information and throttled
            request rate.
          </div>
        </div>
        <Button onClick={onSubmit} label={"Submit"} isPrimary />
      </div>
    </Overlay>
  );
};

export default ApiKeysOverlay;

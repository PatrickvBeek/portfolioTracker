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
        <Button onClick={onSubmit} label={"Submit"} isPrimary />
      </div>
    </Overlay>
  );
};

export default ApiKeysOverlay;

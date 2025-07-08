import { Tooltip } from "@mui/material";
import { FC, useState } from "react";
import {
  useGetApiKeys,
  useSetApiKey,
} from "../../../hooks/apiKeys/apiKeyHooks";
import { Button } from "../../general/Button";
import Overlay from "../../general/Overlay/Overlay";
import { TextInput } from "../../general/TextInput";
import styles from "./ApiKeys.module.less";

export const ApiKeys: FC = ({}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [yahooKey, setYahooKey] = useState(useGetApiKeys()?.yahoo || "");
  const submitYahooKey = useSetApiKey("yahoo");

  return (
    <div className={"styles.container"}>
      <Tooltip title="Mange API keys">
        <i
          className="fa-solid fa-key"
          style={{ color: "white" }}
          onClick={() => setIsOverlayOpen(true)}
        />
      </Tooltip>
      <Overlay
        open={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        title={"Manage API Keys"}
      >
        <div className={styles.form}>
          <TextInput
            label={"Yahoo Finance API Key"}
            text={yahooKey}
            onChange={(e) => setYahooKey(e.target.value)}
          ></TextInput>
          <Button
            onClick={() => {
              submitYahooKey(yahooKey);
              setIsOverlayOpen(false);
            }}
            label={"Submit"}
            isPrimary
          />
        </div>
      </Overlay>
    </div>
  );
};

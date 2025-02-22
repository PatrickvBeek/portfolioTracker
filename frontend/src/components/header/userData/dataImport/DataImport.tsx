import { Tooltip } from "@mui/material";
import { FC, ReactElement, useId, useState } from "react";
import { useSetApiKeys } from "../../../../hooks/apiKeys/apiKeyHooks";
import { useSetAssets } from "../../../../hooks/assets/assetHooks";
import { useSetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { Button } from "../../../general/Button";
import Overlay from "../../../general/Overlay/Overlay";
import { parseUserData } from "../userData";
import styles from "./DataImport.module.less";

export const DataImport: FC = (): ReactElement => {
  const setPortfolios = useSetPortfolios();
  const setAssets = useSetAssets();
  const setApiKeys = useSetApiKeys();

  const id = useId();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onerror = () => {
          setIsOverlayOpen(true);
        };
        fileReader.onload = (evt) => {
          const readingResult = evt.target?.result;
          if (typeof readingResult === "string") {
            try {
              const parsedUserData = parseUserData(readingResult);
              setPortfolios(parsedUserData.portfolios);
              setAssets(parsedUserData.assets);
              setApiKeys(parsedUserData.apiKeys);
            } catch (e) {
              console.log(e);
              setIsOverlayOpen(true);
            }
          } else {
            throw new Error("parsed input type is not 'string'");
          }
        };
      }
    } catch (e) {
      console.log(e);
      setIsOverlayOpen(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById(id)?.click();
    }
  };

  return (
    <Tooltip title={"Import all your data from a file"}>
      <div>
        <label
          htmlFor={id}
          className={styles.label}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <i
            className={"fa-file-arrow-up fa-solid fa-lg"}
            style={{ color: "white" }}
          />
        </label>
        <input
          className={styles.input}
          type="file"
          id={id}
          accept=".json"
          onChange={handleChange}
        />
        {isOverlayOpen && (
          <Overlay title={"Error"} onClose={() => setIsOverlayOpen(false)}>
            <div className={styles.overlay_content}>
              <div>
                Oh no! 😢 <br />
                An unknown error occurred while reading the selected file.
              </div>
              <Button
                onClick={() => setIsOverlayOpen(false)}
                label={"Okay"}
                isPrimary
              />
            </div>
          </Overlay>
        )}
      </div>
    </Tooltip>
  );
};

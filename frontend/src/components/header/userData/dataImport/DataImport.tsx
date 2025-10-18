import { Tooltip } from "@mui/material";
import { FC, ReactElement, useId } from "react";
import { InfoDialog } from "../../../general/InfoDialog/InfoDialog";
import styles from "./DataImport.module.less";
import { useDataImport } from "./useDataImport";

export const DataImport: FC = (): ReactElement => {
  const { handleFileInputChange, isErrorDialogOpen, setIsErrorDialogOpen } =
    useDataImport();
  const id = useId();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById(id)?.click();
    }
  };

  return (
    <>
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
        </div>
      </Tooltip>

      <input
        className={styles.input}
        type="file"
        id={id}
        accept=".json"
        onChange={handleFileInputChange}
      />

      <InfoDialog
        open={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        title="Error parsing file"
        message={
          <div>
            Oh no! 😢 <br />
            An unknown error occurred while reading the selected file.
          </div>
        }
        actionLabel="Okay"
      />
    </>
  );
};

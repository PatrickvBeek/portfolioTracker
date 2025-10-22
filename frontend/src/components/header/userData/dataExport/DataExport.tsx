import { IconButton, Tooltip } from "@mui/material";
import { FC, ReactElement } from "react";
import { useDataExport } from "./useDataExport";

export const DataExport: FC = (): ReactElement | null => {
  const { exportData, canExport } = useDataExport();

  if (!canExport) {
    return null;
  }

  return (
    <Tooltip title={"Export all data into a file"}>
      <IconButton onClick={exportData}>
        <i
          className="fa-solid fa-file-arrow-down fa-lg"
          style={{ color: "white" }}
        />
      </IconButton>
    </Tooltip>
  );
};

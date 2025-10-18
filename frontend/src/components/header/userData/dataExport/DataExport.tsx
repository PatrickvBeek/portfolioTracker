import { Tooltip } from "@mui/material";
import { FC, ReactElement } from "react";
import { useDataExport } from "./useDataExport";

export const DataExport: FC = (): ReactElement | null => {
  const { exportData, canExport } = useDataExport();

  if (!canExport) {
    return null;
  }

  return (
    <Tooltip title={"Export all data into a file"}>
      {/* this div prevents the icon from rendering above the other icons in the row  */}
      <div>
        <i
          className="fa-solid fa-file-arrow-down fa-lg"
          style={{ color: "white", cursor: "pointer" }}
          onClick={exportData}
        />
      </div>
    </Tooltip>
  );
};

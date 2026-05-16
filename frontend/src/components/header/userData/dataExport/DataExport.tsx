import { FC, ReactElement } from "react";
import { Download } from "lucide-react";
import { Tooltip } from "../../../ui/Tooltip";
import { useDataExport } from "./useDataExport";

export const DataExport: FC = (): ReactElement | null => {
  const { exportData, canExport } = useDataExport();

  if (!canExport) {
    return null;
  }

  return (
    <Tooltip content="Export all data into a file" side="bottom">
      <button
        className="inline-flex items-center justify-center rounded-md p-2 text-text-muted hover:text-text hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
        onClick={exportData}
        aria-label="Export all data into a file"
      >
        <Download size={18} />
      </button>
    </Tooltip>
  );
};

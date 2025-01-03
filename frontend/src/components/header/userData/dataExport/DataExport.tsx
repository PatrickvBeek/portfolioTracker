import { Tooltip } from "@mui/material";
import { FC, ReactElement } from "react";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { EXPORT_VERSION, ExportedData } from "../userData";

export const DataExport: FC = (): ReactElement | null => {
  const portfolioQuery = useGetPortfolios();
  const assetLib = useGetAssets();

  if (!portfolioQuery.data || !assetLib) {
    return null;
  }

  const data: ExportedData = {
    portfolios: portfolioQuery.data,
    assets: assetLib,
    meta: { exportVersion: EXPORT_VERSION },
  };
  const dataString = JSON.stringify(data, null, 2);
  const blob = new Blob([dataString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  return (
    <Tooltip title={"Export all data into a file"}>
      <a href={url} download={"portfolioTracker_dataExport.json"}>
        <i
          className="fa-solid fa-file-arrow-down fa-lg"
          style={{ color: "white" }}
        />
      </a>
    </Tooltip>
  );
};

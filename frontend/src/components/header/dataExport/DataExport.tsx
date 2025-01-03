import { Tooltip } from "@mui/material";
import { FC, ReactElement } from "react";
import { AssetLibrary } from "../../../../../domain/src/asset/asset.entities";
import { PortfolioLibrary } from "../../../../../domain/src/portfolio/portfolio.entities";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../hooks/portfolios/portfolioHooks";

const EXPORT_VERSION = 1;

type ExportedData = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  meta: {
    exportVersion: number;
  };
};

export const DataExport: FC<{}> = ({}): ReactElement | null => {
  const portfolioQuery = useGetPortfolios();
  const assetsQuery = useGetAssets();

  if (!portfolioQuery.data || !assetsQuery.data) {
    return null;
  }

  const data: ExportedData = {
    portfolios: portfolioQuery.data,
    assets: assetsQuery.data,
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

import { Tooltip } from "@mui/material";
import { FC, ReactElement } from "react";
import { useGetApiKeys } from "../../../../hooks/apiKeys/apiKeyHooks";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { EXPORT_VERSION, UserData } from "../userData";

export const DataExport: FC = (): ReactElement | null => {
  const portfolioLib = useGetPortfolios();
  const assetLib = useGetAssets();
  const apiKeys = useGetApiKeys();

  if (!portfolioLib || !assetLib || !apiKeys) {
    return null;
  }

  const data: UserData = {
    portfolios: portfolioLib,
    assets: assetLib,
    apiKeys: apiKeys,
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

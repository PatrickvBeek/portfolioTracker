import { useCallback } from "react";
import { useGetApiKeys } from "../../../../hooks/apiKeys/apiKeyHooks";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { EXPORT_VERSION, UserData } from "../userData";

export const useDataExport = () => {
  const portfolioLib = useGetPortfolios();
  const assetLib = useGetAssets();
  const apiKeys = useGetApiKeys();

  const exportData = useCallback(() => {
    if (!portfolioLib || !assetLib || !apiKeys) {
      console.warn("Data not ready for export");
      return;
    }

    const data: UserData = {
      portfolios: portfolioLib,
      assets: assetLib,
      apiKeys: apiKeys,
      meta: { exportVersion: EXPORT_VERSION },
    };

    const dataString = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataString);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "portfolioTracker_dataExport.json");
    linkElement.click();
  }, [portfolioLib, assetLib, apiKeys]);

  const canExport = !!(portfolioLib && assetLib && apiKeys);

  return {
    exportData,
    canExport,
  };
};

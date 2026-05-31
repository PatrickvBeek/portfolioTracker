import { useCallback } from "react";
import { UserData, useGetUserData } from "../../../../userDataContext";

export const useDataExport = () => {
  const getUserData = useGetUserData();

  const exportData = useCallback(() => {
    const data: UserData = getUserData();

    const dataString = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataString);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "portfolioTracker_dataExport.json");
    linkElement.click();
  }, [getUserData]);

  return exportData;
};

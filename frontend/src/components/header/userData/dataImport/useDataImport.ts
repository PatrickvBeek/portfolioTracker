import { useCallback, useState } from "react";
import { useSetApiKeys } from "../../../../hooks/apiKeys/apiKeyHooks";
import { useSetAssets } from "../../../../hooks/assets/assetHooks";
import { useSetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { parseUserData } from "../userData";

export const useDataImport = () => {
  const setPortfolios = useSetPortfolios();
  const setAssets = useSetAssets();
  const setApiKeys = useSetApiKeys();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const importData = useCallback(
    (file: File) => {
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onerror = () => {
        setIsErrorDialogOpen(true);
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
            setIsErrorDialogOpen(true);
          }
        } else {
          console.error("parsed input type is not 'string'");
          setIsErrorDialogOpen(true);
        }
      };
    },
    [setPortfolios, setAssets, setApiKeys]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (file) {
          importData(file);
        }
      } catch (e) {
        console.log(e);
        setIsErrorDialogOpen(true);
      }
    },
    [importData]
  );

  const triggerFileImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        importData(file);
      }
    };
    input.click();
  }, [importData]);

  return {
    handleFileInputChange,
    triggerFileImport,
    isErrorDialogOpen,
    setIsErrorDialogOpen,
  };
};

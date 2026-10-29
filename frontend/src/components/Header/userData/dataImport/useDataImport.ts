import { useCallback, useState } from "react";
import { parseUserData, useSetAllUserData } from "../../../../userDataContext";

export const useDataImport = () => {
  const setAllUserData = useSetAllUserData();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const showError = useCallback(() => setIsErrorDialogOpen(true), []);

  const handleFileContent = useCallback(
    (result: string | ArrayBuffer | null) => {
      if (typeof result !== "string") {
        console.error("parsed input type is not 'string'");
        showError();
        return;
      }

      try {
        const parsedUserData = parseUserData(result);
        setAllUserData(parsedUserData);
      } catch (e) {
        console.log(e);
        showError();
      }
    },
    [setAllUserData, showError]
  );

  const importData = useCallback(
    (file: File) => {
      const fileReader = new FileReader();
      fileReader.addEventListener("error", showError);
      fileReader.addEventListener("load", (evt) => {
        handleFileContent(evt.target?.result ?? null);
      });
      fileReader.readAsText(file, "UTF-8");
    },
    [handleFileContent, showError]
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
        showError();
      }
    },
    [importData, showError]
  );

  const triggerFileImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) {
        importData(file);
      }
    });
    input.click();
  }, [importData]);

  return {
    handleFileInputChange,
    triggerFileImport,
    isErrorDialogOpen,
    setIsErrorDialogOpen,
  };
};

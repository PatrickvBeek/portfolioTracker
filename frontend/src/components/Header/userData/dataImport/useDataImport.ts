import { useCallback, useState } from "react";
import { parseUserData, useSetAllUserData } from "../../../../userDataContext";

export const useDataImport = () => {
  const setAllUserData = useSetAllUserData();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const importData = useCallback(
    (file: File) => {
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.addEventListener("error", () => {
        setIsErrorDialogOpen(true);
      });
      fileReader.addEventListener("load", (evt) => {
        const readingResult = evt.target?.result;
        if (typeof readingResult === "string") {
          try {
            const parsedUserData = parseUserData(readingResult);
            setAllUserData(parsedUserData);
          } catch (e) {
            console.log(e);
            setIsErrorDialogOpen(true);
          }
        } else {
          console.error("parsed input type is not 'string'");
          setIsErrorDialogOpen(true);
        }
      });
    },
    [setAllUserData]
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

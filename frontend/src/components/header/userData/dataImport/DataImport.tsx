import { FC, ReactElement, useId } from "react";
import { Upload } from "lucide-react";
import { Button } from "../../../ui/Button";
import { Dialog } from "../../../ui/Dialog";
import { Tooltip } from "../../../ui/Tooltip";
import { useDataImport } from "./useDataImport";

export const DataImport: FC = (): ReactElement => {
  const { handleFileInputChange, isErrorDialogOpen, setIsErrorDialogOpen } =
    useDataImport();
  const id = useId();

  const handleButtonClick = () => {
    document.getElementById(id)?.click();
  };

  return (
    <>
      <Tooltip content="Import all your data from a file" side="bottom">
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-text-muted hover:text-text hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
          onClick={handleButtonClick}
          aria-label="Import all your data from a file"
        >
          <Upload size={18} />
        </button>
      </Tooltip>

      <input
        type="file"
        id={id}
        accept=".json"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <Dialog
        open={isErrorDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsErrorDialogOpen(false);
          }
        }}
        title="Error parsing file"
      >
        <div className="text-text">
          Oh no! 😢 <br />
          An unknown error occurred while reading the selected file.
        </div>
        <div className="mt-6 flex justify-end">
          <Button intent="ghost" onClick={() => setIsErrorDialogOpen(false)}>
            Okay
          </Button>
        </div>
      </Dialog>
    </>
  );
};

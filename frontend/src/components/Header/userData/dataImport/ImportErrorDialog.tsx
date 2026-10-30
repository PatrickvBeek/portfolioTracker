import { type FC, type ReactElement } from "react";
import { Button } from "../../../ui/Button";
import { Dialog } from "../../../ui/Dialog";

type ImportErrorDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const ImportErrorDialog: FC<ImportErrorDialogProps> = ({
  open,
  onClose,
}): ReactElement => (
  <Dialog
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        onClose();
      }
    }}
    title="Error parsing file"
  >
    <div className="text-text">
      Oh no! 😢 <br />
      An unknown error occurred while reading the selected file.
    </div>
    <div className="mt-6 flex justify-end">
      <Button intent="ghost" onClick={onClose}>
        Okay
      </Button>
    </div>
  </Dialog>
);

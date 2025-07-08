import { DialogActions } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import { Button } from "../Button";
import Overlay from "../Overlay/Overlay";

export interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  actionLabel?: string;
}

export function InfoDialog({
  open,
  onClose,
  title,
  message,
  actionLabel = "OK",
}: InfoDialogProps): ReactElement {
  return (
    <Overlay open={open} onClose={onClose} title={title}>
      <>
        {message}
        <DialogActions>
          <Button onClick={onClose} label={actionLabel} isPrimary autoFocus />
        </DialogActions>
      </>
    </Overlay>
  );
}

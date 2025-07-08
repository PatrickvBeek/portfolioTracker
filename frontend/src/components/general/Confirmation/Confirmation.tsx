import { DialogActions, DialogContent } from "@mui/material";
import { ReactNode } from "react";
import { Button } from "../Button";
import Overlay from "../Overlay/Overlay";

export type ConfirmationProps = {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  primary?: "confirm" | "cancel";
};

const Confirmation = ({
  title,
  body,
  confirmLabel,
  cancelLabel,
  open,
  onConfirm,
  onCancel,
  primary = "cancel",
}: ConfirmationProps) => {
  return (
    <Overlay open={open} onClose={onCancel} title={title}>
      <>
        <DialogContent>{body}</DialogContent>
        <DialogActions sx={{ gap: 1, justifyContent: "flex-end" }}>
          <Button
            onClick={onCancel}
            label={cancelLabel}
            isPrimary={primary === "cancel"}
            autoFocus={primary === "cancel"}
          />
          <Button
            onClick={onConfirm}
            label={confirmLabel}
            isPrimary={primary === "confirm"}
            autoFocus={primary === "confirm"}
          />
        </DialogActions>
      </>
    </Overlay>
  );
};

export default Confirmation;

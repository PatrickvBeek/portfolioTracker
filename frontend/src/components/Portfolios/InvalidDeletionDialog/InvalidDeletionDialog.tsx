import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ReactElement } from "react";

interface DeletionBlockedDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InvalidDeletionDialog({
  open,
  onClose,
}: DeletionBlockedDialogProps): ReactElement {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cannot Delete Transaction</DialogTitle>
      <DialogContent>
        <p>
          This transaction cannot be deleted because it would cause a situation,
          where at least one transaction attempts to sell more pieces than
          available at this point in time.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

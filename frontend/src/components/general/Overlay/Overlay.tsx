import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from "@mui/material";
import { ReactElement } from "react";

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children?: ReactElement;
  title?: string | ReactElement;
}

const Overlay = ({ open, onClose, children, title }: OverlayProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Stack
        alignItems={"center"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        marginBottom={"1rem"}
      >
        <DialogTitle>{title}</DialogTitle>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default Overlay;

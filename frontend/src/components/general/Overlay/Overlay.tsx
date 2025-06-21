import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { ReactElement } from "react";
import styles from "./Overlay.module.less";

export interface OverlayProps {
  onClose: () => void;
  children?: ReactElement;
  title?: string | ReactElement;
}

const Overlay = ({ onClose, children, title }: OverlayProps) => {
  return (
    <Modal open={true} onClose={onClose}>
      <Box className={styles.overlay} role="dialog">
        <Box className={styles.header}>
          <Typography variant="h6" component="span" className={styles.title}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className={styles.body}>{children}</Box>
      </Box>
    </Modal>
  );
};

export default Overlay;

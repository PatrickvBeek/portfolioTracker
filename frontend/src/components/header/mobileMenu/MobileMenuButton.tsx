import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import styles from "./MobileMenuButton.module.less";

interface MobileMenuButtonProps {
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ onClick }) => {
  return (
    <Tooltip title="Menu">
      <IconButton
        onClick={onClick}
        aria-label="Open navigation menu"
        className={styles.menuButton}
      >
        <i className="fa-solid fa-bars fa-lg" style={{ color: "white" }} />
      </IconButton>
    </Tooltip>
  );
};

export default MobileMenuButton;

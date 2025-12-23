import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import { StyledIcon } from "../../general/StyledComponents";
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
        <StyledIcon className="fa-solid fa-bars fa-lg" />
      </IconButton>
    </Tooltip>
  );
};

export default MobileMenuButton;

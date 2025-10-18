import { Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";
import Overlay from "../../general/Overlay/Overlay";
import SelectionHeader from "../../general/SelectionHeader";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import styles from "./PortfolioSelectionHeader.module.less";

type PortfolioSelectionHeaderProps = {
  portfolioNames: string[];
  selectedPortfolio: string;
  setSelectedPortfolio: (name: string) => void;
};

const PortfolioSelectionHeader = ({
  portfolioNames,
  selectedPortfolio,
  setSelectedPortfolio,
}: PortfolioSelectionHeaderProps) => {
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        <SelectionHeader
          entries={portfolioNames}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
        />
      </div>
      <div className={styles.addButton}>
        <IconButton
          color="primary"
          aria-label="add portfolio"
          onClick={() => setIsAddOverlayOpen(true)}
          size="small"
        >
          <Add />
        </IconButton>
      </div>

      <Overlay
        open={isAddOverlayOpen}
        title="Add a new Portfolio"
        onClose={() => setIsAddOverlayOpen(false)}
      >
        <PortfolioInputForm onConfirm={() => setIsAddOverlayOpen(false)} />
      </Overlay>
    </div>
  );
};

export default PortfolioSelectionHeader;

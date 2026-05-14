import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/Button";
import { Dialog } from "../../ui/Dialog";
import { Tabs } from "../../ui/Tabs";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import { styles } from "./PortfolioSelectionHeader.styles";

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
        <Tabs
          entries={portfolioNames}
          value={selectedPortfolio}
          onValueChange={setSelectedPortfolio}
        />
      </div>
      <div className={styles.addButton}>
        <Button
          intent="ghost"
          aria-label="add portfolio"
          onClick={() => setIsAddOverlayOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>

      <Dialog
        open={isAddOverlayOpen}
        onOpenChange={setIsAddOverlayOpen}
        title="Add a new Portfolio"
      >
        <PortfolioInputForm onConfirm={() => setIsAddOverlayOpen(false)} />
      </Dialog>
    </div>
  );
};

export default PortfolioSelectionHeader;

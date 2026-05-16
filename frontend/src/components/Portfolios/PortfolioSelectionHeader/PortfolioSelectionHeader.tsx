import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeletePortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { Button } from "../../ui/Button";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { Dialog } from "../../ui/Dialog";
import { Tabs } from "../../ui/Tabs";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import { styles } from "./PortfolioSelectionHeader.styles";

type PortfolioSelectionHeaderProps = {
  portfolioNames: string[];
  selectedPortfolio: string;
  setSelectedPortfolio: (name: string) => void;
  portfolioName: string;
};

const PortfolioSelectionHeader = ({
  portfolioNames,
  selectedPortfolio,
  setSelectedPortfolio,
  portfolioName,
}: PortfolioSelectionHeaderProps) => {
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);
  const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false);
  const deletePortfolio = useDeletePortfolio();

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        <Tabs
          entries={portfolioNames}
          value={selectedPortfolio}
          onValueChange={setSelectedPortfolio}
        />
      </div>
      <div className={styles.actions}>
        <Button
          intent="danger-ghost"
          aria-label="delete portfolio"
          onClick={() => setIsDeleteOverlayOpen(true)}
        >
          <Trash2 size={18} />
        </Button>
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

      <ConfirmationDialog
        open={isDeleteOverlayOpen}
        title={`Delete ${portfolioName}?`}
        body={`You are about to delete the portfolio '${portfolioName}'. This will delete also all associated transaction data. Do you want to continue?`}
        confirmLabel={"Delete"}
        cancelLabel={"Cancel"}
        confirmIntent="danger"
        onConfirm={() => {
          deletePortfolio(portfolioName);
          setIsDeleteOverlayOpen(false);
        }}
        onCancel={() => setIsDeleteOverlayOpen(false)}
      />
    </div>
  );
};

export default PortfolioSelectionHeader;

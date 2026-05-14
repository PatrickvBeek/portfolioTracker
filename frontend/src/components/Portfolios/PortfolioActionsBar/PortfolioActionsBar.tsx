import { useState } from "react";
import { useDeletePortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { cn } from "../../../utility/cn";
import { Props } from "../../../utility/types";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { styles } from "./PortfolioActionsBar.styles";

type PortfolioViewSideBarProps = Props<{
  portfolioName: string;
}>;

const PortfolioActionsBar = ({
  className,
  portfolioName,
}: PortfolioViewSideBarProps) => {
  const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false);
  const deletePortfolio = useDeletePortfolio();

  return (
    <div className={cn(styles.container, className)}>
      <h2 className={styles.heading}>{"Actions"}</h2>
      <div
        className={cn(styles.entry)}
        onClick={() => setIsDeleteOverlayOpen(true)}
      >
        {"Delete Portfolio"}
      </div>
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

export default PortfolioActionsBar;

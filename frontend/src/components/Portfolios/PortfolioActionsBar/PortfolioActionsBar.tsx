import { useState } from "react";
import { useDeletePortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import Confirmation from "../../general/Confirmation/Confirmation";
import Overlay from "../../general/Overlay/Overlay";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import "./PortfolioActionsBar.css";

const { bemBlock, bemElement } = bemHelper("portfolio-actions-bar");

export type PortfolioViewSideBarProps = Props<{
  portfolioName: string;
}>;

const PortfolioActionsBar = ({
  className,
  portfolioName,
}: PortfolioViewSideBarProps) => {
  const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false);
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);
  const deletePortfolio = useDeletePortfolio();

  return (
    <div className={bemBlock(className)}>
      <div role={"columnheader"} className={bemElement("heading")}>
        {"Actions"}
      </div>
      <div
        className={bemElement("entry")}
        onClick={() => setIsAddOverlayOpen(true)}
      >
        {"Add Portfolio"}
      </div>
      <div
        className={bemElement("entry")}
        onClick={() => setIsDeleteOverlayOpen(true)}
      >
        {"Delete Portfolio"}
      </div>
      <Confirmation
        open={isDeleteOverlayOpen}
        title={`Delete ${portfolioName}?`}
        body={`You are about to delete the portfolio '${portfolioName}'. This will delete also all associated transaction data. Do you want to continue?`}
        confirmLabel={"Delete"}
        cancelLabel={"Cancel"}
        onConfirm={() => {
          deletePortfolio(portfolioName);
          setIsDeleteOverlayOpen(false);
        }}
        onCancel={() => setIsDeleteOverlayOpen(false)}
      />
      <Overlay
        open={isAddOverlayOpen}
        title={"Add a new Portfolio"}
        onClose={() => setIsAddOverlayOpen(false)}
      >
        <PortfolioInputForm onConfirm={() => setIsAddOverlayOpen(false)} />
      </Overlay>
    </div>
  );
};

export default PortfolioActionsBar;

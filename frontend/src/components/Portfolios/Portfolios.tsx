import MenuIcon from "@mui/icons-material/Menu";
import { Drawer, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { Props } from "../../utility/types";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import SelectionHeader from "../general/SelectionHeader";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioActionsBar from "./PortfolioActionsBar/PortfolioActionsBar";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import styles from "./Portfolios.module.less";
import { PortfolioSummary } from "./portfolioSummary/PortfolioSummary";
import { ClosedPositionsList } from "./PositionList/ClosedPositionsList/ClosedPositionsList";
import { OpenPositionsList } from "./PositionList/OpenPositionsList/OpenPositionsList";

export type PortfolioProps = Props<{}>;

function Portfolios({ className }: PortfolioProps) {
  const portfolioLib = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(Object.keys(portfolioLib)[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileOrderSidebarOpen, setMobileOrderSidebarOpen] = useState(false);

  useEffect(() => {
    const portfolios = Object.keys(portfolioLib || {});
    if (!selectedPortfolio || !portfolios.includes(selectedPortfolio)) {
      setSelectedPortfolio(portfolios[0]);
    }
  }, [portfolioLib, selectedPortfolio]);

  if (Object.keys(portfolioLib).length < 1) {
    return <EmptyPortfolios />;
  }

  if (!selectedPortfolio) {
    return <></>;
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <SelectionHeader
          entries={Object.keys(portfolioLib)}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
        />
      </div>

      <div className={styles.content}>
        <PortfolioSummary portfolioName={selectedPortfolio} />
        <PortfolioBalancesChart portfolioName={selectedPortfolio} />
        <TimeWeightedReturnChart portfolioName={selectedPortfolio} />
        <OpenPositionsList portfolioName={selectedPortfolio} />
        <ClosedPositionsList portfolioName={selectedPortfolio} />
        <ActivityList portfolio={selectedPortfolio} />
      </div>

      {/* Order Sidebar */}
      <PortfolioFormSideBar
        className={styles.orderSideBar}
        portfolioName={selectedPortfolio}
      />
      <IconButton
        className={styles.orderMenuButton}
        onClick={() => setMobileOrderSidebarOpen(true)}
        aria-label="Open order form"
      >
        <span>+</span>
      </IconButton>
      <Drawer
        anchor="right"
        open={mobileOrderSidebarOpen}
        onClose={() => setMobileOrderSidebarOpen(false)}
      >
        <div className={styles.drawerContent}>
          <PortfolioFormSideBar portfolioName={selectedPortfolio} />
        </div>
      </Drawer>

      {/* Actions Sidebar */}
      <PortfolioActionsBar
        className={styles.sideBar}
        portfolioName={selectedPortfolio}
      />
      <IconButton
        className={styles.menuButton}
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open portfolio actions"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      >
        <div className={styles.drawerContent}>
          <PortfolioActionsBar portfolioName={selectedPortfolio} />
        </div>
      </Drawer>
    </div>
  );
}

export default Portfolios;

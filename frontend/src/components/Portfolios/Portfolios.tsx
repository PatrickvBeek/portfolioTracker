import MenuIcon from "@mui/icons-material/Menu";
import { Box, Drawer, IconButton, styled } from "@mui/material";
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
      <Box className={styles.orderSideBar}>
        <PortfolioFormSideBar portfolioName={selectedPortfolio} />
      </Box>
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
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      >
        <div className={styles.drawerContent}>
          <PortfolioActionsBar portfolioName={selectedPortfolio} />
        </div>
      </Drawer>

      <StyledFloatingButton
        className={styles.orderMenuButton}
        onClick={() => setMobileOrderSidebarOpen(true)}
        aria-label="Open order form"
        sx={{
          display: {
            lg: "none",
          },
          bottom: "2rem",
          right: "2rem",
          left: "auto",
          top: "auto",
        }}
      >
        <span>+</span>
      </StyledFloatingButton>
      <StyledFloatingButton
        className={styles.menuButton}
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open portfolio actions"
        sx={{
          display: {
            lg: "none",
          },
          bottom: "2rem",
          left: "2rem",
          right: "auto",
          top: "auto",
        }}
      >
        <MenuIcon />
      </StyledFloatingButton>
    </div>
  );
}

const StyledFloatingButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  fontSize: "2rem",
  fontWeight: "bold",
}));

export default Portfolios;

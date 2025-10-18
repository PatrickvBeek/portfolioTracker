import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Divider, Drawer, IconButton, Stack, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { Props } from "../../utility/types";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioActionsBar from "./PortfolioActionsBar/PortfolioActionsBar";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import styles from "./Portfolios.module.less";
import PortfolioSelectionHeader from "./PortfolioSelectionHeader/PortfolioSelectionHeader";
import { PortfolioSummary } from "./portfolioSummary/PortfolioSummary";
import { ClosedPositionsList } from "./PositionList/ClosedPositionsList/ClosedPositionsList";
import { OpenPositionsList } from "./PositionList/OpenPositionsList/OpenPositionsList";

export type PortfolioProps = Props;

function Portfolios({ className }: PortfolioProps) {
  const portfolioLib = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(Object.keys(portfolioLib)[0]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
        <PortfolioSelectionHeader
          portfolioNames={Object.keys(portfolioLib)}
          selectedPortfolio={selectedPortfolio}
          setSelectedPortfolio={setSelectedPortfolio}
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

      <Box className={styles.orderSideBar}>
        <PortfolioFormSideBar portfolioName={selectedPortfolio} />
      </Box>

      <PortfolioActionsBar
        className={styles.sideBar}
        portfolioName={selectedPortfolio}
      />

      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        <div className={styles.drawerContent}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="flex-end">
              <IconButton
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <PortfolioFormSideBar portfolioName={selectedPortfolio} />
            <Divider />
            <PortfolioActionsBar portfolioName={selectedPortfolio} />
          </Stack>
        </div>
      </Drawer>

      <StyledFloatingButton
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Open portfolio menu"
        sx={{
          display: {
            lg: "none",
          },
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
  left: "auto",
  top: "auto",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  fontWeight: "bold",
}));

export default Portfolios;

import { Plus } from "lucide-react";
import { useState } from "react";
import { useGetPortfolios } from "../../userDataContext";
import { PortfolioBalancesChart } from "../charts/BalancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/TimeWeightedReturnChart/TimeWeightedReturnChart";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import { styles } from "./Portfolios.styles";
import PortfolioSelectionHeader from "./PortfolioSelectionHeader/PortfolioSelectionHeader";
import { PortfolioSummary } from "./PortfolioSummary/PortfolioSummary";
import { Positions } from "./Positions/Positions";

function Portfolios() {
  const portfolioLib = useGetPortfolios();
  const portfolioNames = Object.keys(portfolioLib);
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(portfolioNames[0]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const selected =
    selectedPortfolio && portfolioNames.includes(selectedPortfolio)
      ? selectedPortfolio
      : portfolioNames[0];

  if (portfolioNames.length < 1) {
    return <EmptyPortfolios />;
  }

  if (!selected) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PortfolioSelectionHeader
          portfolioNames={portfolioNames}
          selectedPortfolio={selected}
          setSelectedPortfolio={setSelectedPortfolio}
          portfolioName={selected}
        />
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <PortfolioSummary portfolioNames={[selected]} />
          <PortfolioBalancesChart portfolioNames={[selected]} />
          <TimeWeightedReturnChart portfolioNames={[selected]} />
          <Positions portfolioName={selected} />
          <ActivityList portfolio={selected} />
        </div>

        <div className={styles.formSidebar}>
          <PortfolioFormSideBar portfolioName={selected} />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <PortfolioFormSideBar portfolioName={selected} />
      </Sheet>

      <Button
        className={styles.sheetTrigger}
        intent="primary"
        onClick={() => setSheetOpen(true)}
        aria-label="Add portfolio data"
      >
        <Plus size={30} />
      </Button>
    </div>
  );
}

export default Portfolios;

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { Props } from "../../utility/types";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import { styles } from "./Portfolios.styles";
import PortfolioSelectionHeader from "./PortfolioSelectionHeader/PortfolioSelectionHeader";
import { PortfolioSummary } from "./portfolioSummary/PortfolioSummary";
import { Positions } from "./Positions/Positions";

type PortfolioProps = Props;

function Portfolios({ className }: PortfolioProps) {
  const portfolioLib = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(Object.keys(portfolioLib)[0]);
  const [sheetOpen, setSheetOpen] = useState(false);

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
          portfolioName={selectedPortfolio}
        />
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <PortfolioSummary portfolioNames={[selectedPortfolio]} />
          <PortfolioBalancesChart portfolioNames={[selectedPortfolio]} />
          <TimeWeightedReturnChart portfolioNames={[selectedPortfolio]} />
          <Positions portfolioName={selectedPortfolio} />
          <ActivityList portfolio={selectedPortfolio} />
        </div>

        <div className={styles.formSidebar}>
          <PortfolioFormSideBar portfolioName={selectedPortfolio} />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <PortfolioFormSideBar portfolioName={selectedPortfolio} />
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

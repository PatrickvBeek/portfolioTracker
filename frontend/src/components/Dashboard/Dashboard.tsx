import { Chip } from "@mui/material";
import { toCompoundPortfolioName } from "pt-domain";
import { useState } from "react";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import { Headline } from "../general/headline/Headline";
import { PortfolioSummary } from "../Portfolios/portfolioSummary/PortfolioSummary";
import { usePortfolioNames } from "./Dashboard.logic";
import styles from "./Dashboard.module.less";

const Dashboard = () => {
  const portfolioNames = usePortfolioNames();
  const [selectedPortfolios, setSelectedPortfolios] = useState(portfolioNames);
  const hasPortfolios = portfolioNames.length > 0;

  const togglePortfolio = (portfolio: string) => {
    setSelectedPortfolios((prev) =>
      prev.includes(portfolio)
        ? prev.filter((p) => p !== portfolio)
        : [...prev, portfolio]
    );
  };

  if (!hasPortfolios) {
    return (
      <div className={styles.emptyState}>
        <h2>No portfolios available</h2>
        <p>Create a portfolio to see your combined financial overview</p>
      </div>
    );
  }

  const compoundName = toCompoundPortfolioName(selectedPortfolios);
  const hasSelections = selectedPortfolios.length > 0;

  return (
    <div className={styles.container}>
      <div>
        <Headline text={"Included Portfolios"} className={styles.headline} />
        <div className={styles.portfolioSelection}>
          {portfolioNames.map((name) => (
            <Chip
              key={name}
              label={name}
              color={selectedPortfolios.includes(name) ? "primary" : "default"}
              aria-selected={selectedPortfolios.includes(name)}
              onClick={() => togglePortfolio(name)}
              variant={
                selectedPortfolios.includes(name) ? "filled" : "outlined"
              }
            />
          ))}
        </div>
      </div>

      {hasSelections ? (
        <>
          <PortfolioSummary portfolioName={compoundName} />
          <PortfolioBalancesChart portfolioName={compoundName} />
          <TimeWeightedReturnChart portfolioName={compoundName} />
        </>
      ) : (
        <div className={styles.emptyState}>
          <h2>No portfolios selected</h2>
          <p>Select one or more portfolios to view combined data</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Heading } from "../ui/Heading";
import { Tag } from "../ui/Tag";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import { PortfolioSummary } from "../Portfolios/portfolioSummary/PortfolioSummary";
import { usePortfolioNames } from "./Dashboard.logic";
import { styles } from "./Dashboard.styles";

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

  const hasSelections = selectedPortfolios.length > 0;

  return (
    <div className={styles.container}>
      <div>
        <Heading level="h1" className={styles.headline}>
          Included Portfolios
        </Heading>
        <div className={styles.portfolioSelection}>
          {portfolioNames.map((name) => (
            <Tag
              key={name}
              selected={selectedPortfolios.includes(name)}
              onClick={() => togglePortfolio(name)}
            >
              {name}
            </Tag>
          ))}
        </div>
      </div>

      {hasSelections ? (
        <>
          <PortfolioSummary portfolioNames={selectedPortfolios} />
          <PortfolioBalancesChart portfolioNames={selectedPortfolios} />
          <TimeWeightedReturnChart portfolioNames={selectedPortfolios} />
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

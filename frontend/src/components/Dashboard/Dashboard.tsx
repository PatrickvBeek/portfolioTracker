import { toCompoundPortfolioName } from "pt-domain/src/utils/portfolioUtils";
import { PortfolioBalancesChart } from "../charts/balancesChart/BalancesChart";
import { TimeWeightedReturnChart } from "../charts/timeWeightedReturnChart/TimeWeightedReturnChart";
import { PortfolioSummary } from "../Portfolios/portfolioSummary/PortfolioSummary";
import { usePortfolioNames } from "./Dashboard.logic";
import styles from "./Dashboard.module.less";

const Dashboard = () => {
  const portfolioNames = usePortfolioNames();
  const hasPortfolios = portfolioNames.length > 0;

  if (!hasPortfolios) {
    return (
      <div className={styles.emptyState}>
        <h2>No portfolios available</h2>
        <p>Create a portfolio to see your combined financial overview</p>
      </div>
    );
  }

  const compoundName = toCompoundPortfolioName(portfolioNames);

  return (
    <div className={styles.container}>
      <PortfolioSummary portfolioName={compoundName} />

      <PortfolioBalancesChart portfolioName={compoundName} />
      <TimeWeightedReturnChart portfolioName={compoundName} />
    </div>
  );
};

export default Dashboard;

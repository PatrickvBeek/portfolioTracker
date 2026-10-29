import { usePortfolioNames } from "../Dashboard/Dashboard.logic";
import WithdrawalPlanner from "./WithdrawalPlanner";
import { styles } from "./WithdrawalPlanner.styles";

export const WithdrawalPlannerTab = () => {
  const portfolioNames = usePortfolioNames();

  if (portfolioNames.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No portfolios available</h2>
        <p>Create a portfolio to plan your withdrawals</p>
      </div>
    );
  }

  return <WithdrawalPlanner portfolioNames={portfolioNames} />;
};

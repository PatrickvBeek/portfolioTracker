import { getProfitHistory, History } from "pt-domain";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { usePortfolioPriceData } from "../../chartHooks";
import { usePortfolioTimeAxis } from "../shared/balancesChart.utils";

export const useProfitHistory = (
  portfolioName: string
): CustomQuery<History<number>> => {
  const portfolio = useGetPortfolio(portfolioName);
  const timeAxis = usePortfolioTimeAxis(portfolioName);
  const priceQuery = usePortfolioPriceData(portfolioName);

  const profitHistory = getProfitHistory(portfolio, priceQuery.data, timeAxis);

  return {
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    data: profitHistory,
  };
};

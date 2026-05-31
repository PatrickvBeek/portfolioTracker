import { combinePortfolios, getProfitHistory, History } from "pt-domain";
import { useGetPortfoliosByNames } from "../../../../userDataContext";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { ChartRange } from "../../chartRange.types";
import { usePortfolioPriceData } from "../../chartHooks";
import { usePortfolioTimeAxis } from "../shared/balancesChart.utils";

export const useProfitHistory = (
  portfolioNames: string[],
  range: ChartRange
): CustomQuery<History<number>> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const timeAxis = usePortfolioTimeAxis(portfolioNames, range);
  const priceQuery = usePortfolioPriceData(portfolioNames);

  const profitHistory = getProfitHistory(merged, priceQuery.data, timeAxis);

  return {
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    data: profitHistory,
  };
};

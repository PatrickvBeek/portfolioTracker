import {
  combinePortfolios,
  getBuyValueHistoryForPortfolio,
  getMarketValueHistory,
  getTotalCashFlowHistory,
  History,
  pickValueFromHistory,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain";
import { sum, unique } from "radash";
import { useGetPortfoliosByNames } from "../../../../hooks/portfolios/portfolioHooks";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { usePortfolioPriceData } from "../../chartHooks";
import { ChartDataPoint } from "../../chartTypes";
import { historiesToChartData } from "../../chartUtils";
import { usePortfolioTimeAxis } from "../shared/balancesChart.utils";

export type BalancesChartDataSets = "buyValue" | "cashFlow" | "marketValue";

export type BalancesChartData = ChartDataPoint<BalancesChartDataSets>[];

export const useGetPortfolioHistoryChartData = (
  portfolioNames: string[]
): CustomQuery<BalancesChartData> => {
  const buyValueHistory = useGetBuyValueHistory(portfolioNames);
  const cashFlowHistory = useGetCashFlowHistory(portfolioNames);
  const marketValueHistory = useGetMarketValueHistory(portfolioNames);

  return {
    isLoading: marketValueHistory.isLoading,
    isError: marketValueHistory.isError,
    data: historiesToChartData<BalancesChartDataSets>([
      { history: extendToToday(buyValueHistory), newKey: "buyValue" },
      { history: extendToToday(cashFlowHistory), newKey: "cashFlow" },
      { history: marketValueHistory.data || [], newKey: "marketValue" },
    ]),
  };
};

export const useGetBuyValueHistory = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const allHistories = portfolios.map(getBuyValueHistoryForPortfolio);

  const allTimestamps = unique(
    allHistories.flat().map((p) => p.timestamp)
  ).sort((a, b) => a - b);

  const merged = allTimestamps.map((timestamp) => ({
    timestamp,
    value: sum(
      allHistories,
      (history) => pickValueFromHistory(history, timestamp)?.value ?? 0
    ),
  }));

  return removeDuplicatesAtSameTimeStamp(merged);
};

const useGetCashFlowHistory = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  return merged
    ? removeDuplicatesAtSameTimeStamp(getTotalCashFlowHistory(merged))
    : [];
};

const useGetMarketValueHistory = (
  portfolioNames: string[]
): CustomQuery<History<number>> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const timeAxis = usePortfolioTimeAxis(portfolioNames);
  const priceQuery = usePortfolioPriceData(portfolioNames);

  return {
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    data: getMarketValueHistory(merged, priceQuery.data, timeAxis),
  };
};

const extendToToday = (history: History<number>): History<number> => {
  const lastValue = history.at(-1);
  return history.concat(
    lastValue ? [{ timestamp: Date.now(), value: lastValue.value }] : []
  );
};

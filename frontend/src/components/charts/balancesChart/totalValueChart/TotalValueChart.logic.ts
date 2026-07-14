import {
  combinePortfolios,
  getCombinedBuyValueHistory,
  getMarketValueHistory,
  getTotalCashFlowHistory,
  History,
  pickValueFromHistory,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain";
import { useGetPortfoliosByNames } from "../../../../userDataContext";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { usePortfolioPriceData } from "../../chartHooks";
import { ChartDataPoint } from "../../chartTypes";
import { ChartRange } from "../../chartRange.types";
import { historiesToChartData } from "../../chartUtils";
import { usePortfolioTimeAxis } from "../shared/balancesChart.utils";

export type BalancesChartDataSets = "buyValue" | "cashFlow" | "marketValue";

type BalancesChartData = ChartDataPoint<BalancesChartDataSets>[];

export const useGetPortfolioHistoryChartData = (
  portfolioNames: string[],
  range: ChartRange
): CustomQuery<BalancesChartData> => {
  const buyValueHistory = useGetBuyValueHistory(portfolioNames);
  const cashFlowHistory = useGetCashFlowHistory(portfolioNames);
  const marketValueHistory = useGetMarketValueHistory(portfolioNames, range);
  const timeAxis = usePortfolioTimeAxis(portfolioNames, range);

  const buyValueOnAxis = timeAxis.map((timestamp) => ({
    timestamp,
    value: pickValueFromHistory(buyValueHistory, timestamp)?.value ?? 0,
  }));
  const cashFlowOnAxis = timeAxis.map((timestamp) => ({
    timestamp,
    value: pickValueFromHistory(cashFlowHistory, timestamp)?.value ?? 0,
  }));

  return {
    isLoading: marketValueHistory.isLoading,
    isError: marketValueHistory.isError,
    data: historiesToChartData<BalancesChartDataSets>([
      { history: extendToToday(buyValueOnAxis), newKey: "buyValue" },
      { history: extendToToday(cashFlowOnAxis), newKey: "cashFlow" },
      { history: marketValueHistory.data || [], newKey: "marketValue" },
    ]),
  };
};

export const useGetBuyValueHistory = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  return getCombinedBuyValueHistory(portfolios);
};

const useGetCashFlowHistory = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  return merged
    ? removeDuplicatesAtSameTimeStamp(getTotalCashFlowHistory(merged))
    : [];
};

const useGetMarketValueHistory = (
  portfolioNames: string[],
  range: ChartRange
): CustomQuery<History<number>> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const timeAxis = usePortfolioTimeAxis(portfolioNames, range);
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

import { getNumericDateTime } from "pt-domain/src/activity/activity.derivers";
import {
  getBuyValueHistoryForPortfolio,
  getFirstOrderTimeStamp,
  getMarketValueHistory,
  getProfitHistory,
  getTotalCashFlowHistory,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { removeDuplicatesAtSameTimeStamp } from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { unique } from "radash";
import {
  useGetPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { CustomQuery } from "../../../hooks/prices/priceHooks";
import { usePortfolioPriceData } from "../chartHooks";
import { ChartDataPoint } from "../chartTypes";
import { getDefaultTimeAxis, historiesToChartData } from "../chartUtils";

export type BalancesChartDataSets = "buyValue" | "cashFlow" | "marketValue";

export type BalancesChartData = ChartDataPoint<BalancesChartDataSets>[];

export const useGetPortfolioHistoryChartData = (
  portfolioName: string
): CustomQuery<BalancesChartData> => {
  const buyValueHistory = useGetBuyValueHistory(portfolioName);
  const cashFlowHistory = useGetCashFlowHistory(portfolioName);
  const marketValueHistory = useGetMarketValueHistory(portfolioName);

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

const usePortfolioTimeAxis = (portfolioName: string): number[] => {
  const portfolio = useGetPortfolio(portfolioName);
  const activity = useGetPortfolioActivity(portfolioName);

  const xMin = getFirstOrderTimeStamp(portfolio);

  if (!xMin) {
    return [];
  }

  const portfolioTimestamps = activity.map(getNumericDateTime);
  return unique(
    getDefaultTimeAxis(xMin)
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .sort()
  );
};

const useGetBuyValueHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  return portfolio
    ? removeDuplicatesAtSameTimeStamp(getBuyValueHistoryForPortfolio(portfolio))
    : [];
};

const useGetCashFlowHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio
    ? removeDuplicatesAtSameTimeStamp(getTotalCashFlowHistory(portfolio))
    : [];
};

const useGetMarketValueHistory = (
  portfolioName: string
): CustomQuery<History<number>> => {
  const portfolio = useGetPortfolio(portfolioName);
  const timeAxis = usePortfolioTimeAxis(portfolioName);
  const priceQuery = usePortfolioPriceData(portfolioName);

  return {
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    data: getMarketValueHistory(portfolio, priceQuery.data, timeAxis),
  };
};

const extendToToday = (history: History<number>): History<number> => {
  const lastValue = history.at(-1);
  return history.concat(
    lastValue ? [{ timestamp: Date.now(), value: lastValue.value }] : []
  );
};

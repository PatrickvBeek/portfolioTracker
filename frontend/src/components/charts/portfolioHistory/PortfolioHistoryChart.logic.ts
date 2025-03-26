import { getNumericDateTime } from "pt-domain/src/activity/activity.derivers";
import {
  getBuyValueHistoryForPortfolio,
  getFirstOrderTimeStamp,
  getMarketValueHistory,
  getTotalCashFlowHistory,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { removeDuplicatesAtSameTimeStamp } from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { unique } from "radash";
import {
  useGetPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { useGetPricesForIsins } from "../../../hooks/prices/priceHooks";
import { ChartDataPoint } from "../chartTypes";
import { getDefaultTimeAxis, historiesToChartData } from "../chartUtils";

export type PortfolioHistoryDataSets = "buyValue" | "cashFlow" | "marketValue";

export type PortfolioHistoryChartData =
  ChartDataPoint<PortfolioHistoryDataSets>[];

export const useGetPortfolioHistoryChartData = (
  portfolioName: string
): PortfolioHistoryChartData => {
  const buyValueHistory = useGetBuyValueHistory(portfolioName);
  const cashFlowHistory = useGetCashFlowHistory(portfolioName);
  const marketValueHistory = useGetMarketValueHistory(portfolioName);

  return historiesToChartData<PortfolioHistoryDataSets>([
    { history: extendToToday(buyValueHistory), newKey: "buyValue" },
    { history: extendToToday(cashFlowHistory), newKey: "cashFlow" },
    { history: marketValueHistory, newKey: "marketValue" },
  ]);
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

const useGetMarketValueHistory = (portfolioName: string): History<number> => {
  const portfolio = useGetPortfolio(portfolioName);
  const pricesQuery = useGetPricesForIsins(
    Object.keys(portfolio?.orders || {})
  );
  const activity = useGetPortfolioActivity(portfolioName);

  const xMin = portfolio && getFirstOrderTimeStamp(portfolio);

  if (pricesQuery.isLoading || !xMin) {
    return [];
  }

  const portfolioTimestamps = activity.map(getNumericDateTime);
  const xAxis = unique(
    getDefaultTimeAxis(xMin)
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .sort()
  );

  return getMarketValueHistory(portfolio, pricesQuery.data, xAxis);
};

const extendToToday = (history: History<number>): History<number> => {
  const lastValue = history.at(-1);
  return history.concat(
    lastValue ? [{ timestamp: Date.now(), value: lastValue.value }] : []
  );
};

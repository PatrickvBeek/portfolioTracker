import { getNumericDateTime } from "pt-domain/src/activity/activity.derivers";
import {
  getCashFlowHistory,
  getFirstOrderTimeStamp,
  getMarketValueHistory,
} from "pt-domain/src/portfolio/portfolio.derivers";
import {
  geBuyValueHistoryForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { range, sort, unique } from "radash";
import {
  useGetPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { useGetPricesForIsins } from "../../../hooks/prices/priceHooks";
import { ChartDataPoint } from "../chartTypes";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

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
    { history: buyValueHistory, newKey: "buyValue" },
    { history: cashFlowHistory, newKey: "cashFlow" },
    { history: marketValueHistory, newKey: "marketValue" },
  ]);
};

const useGetBuyValueHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  return portfolio
    ? removeDuplicatesAtSameTimeStamp(geBuyValueHistoryForPortfolio(portfolio))
    : [];
};

const useGetCashFlowHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio
    ? removeDuplicatesAtSameTimeStamp(getCashFlowHistory(portfolio))
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
    Array.from(range(xMin, Date.now(), (i) => i, 7 * DAY_IN_MS))
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .sort()
  );

  return getMarketValueHistory(portfolio, pricesQuery.data, xAxis);
};

const historiesToChartData = <Keys extends string>(
  datasets: { history: History<number>; newKey: Keys }[]
): ChartDataPoint<Keys>[] => {
  const map = new Map<number, ChartDataPoint<Keys>>();

  datasets.forEach((dataset) => {
    dataset.history.forEach((point) => {
      if (!map.has(point.timestamp)) {
        map.set(point.timestamp, {
          timestamp: point.timestamp,
        } as ChartDataPoint<Keys>);
      }
      map.get(point.timestamp)![dataset.newKey] =
        point.value as ChartDataPoint<Keys>[Keys];
    });
  });

  return sort(Array.from(map.values()), (p) => p.timestamp);
};

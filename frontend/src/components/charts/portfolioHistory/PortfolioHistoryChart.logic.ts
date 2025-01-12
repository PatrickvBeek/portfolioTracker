import { getCashFlowHistory } from "pt-domain/src/portfolio/portfolio.derivers";
import {
  geBuyValueHistoryForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { ChartDataPoint } from "../chartTypes";

export type PortfolioHistoryDataSets = "buyValue" | "cashFlow";

export type PortfolioHistoryChartData =
  ChartDataPoint<PortfolioHistoryDataSets>[];

export const useGetPortfolioHistoryChartData = (
  portfolioName: string
): PortfolioHistoryChartData => {
  const buyValueHistory = useGetBuyValueHistory(portfolioName);
  const cashFlowHistory = useGetCashFlowHistory(portfolioName);

  if (buyValueHistory.length !== cashFlowHistory.length) {
    return [];
  }

  return combineHistories<PortfolioHistoryDataSets>([
    { history: buyValueHistory, newKey: "buyValue" },
    { history: cashFlowHistory, newKey: "cashFlow" },
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

const combineHistories = <Keys extends string>(
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

  return Array.from(map.values());
};

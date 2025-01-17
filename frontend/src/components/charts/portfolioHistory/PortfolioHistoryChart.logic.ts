import { getCashFlowHistory } from "pt-domain/src/portfolio/portfolio.derivers";
import {
  geBuyValueHistoryForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { sort } from "radash";
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

  return historiesToChartData<PortfolioHistoryDataSets>([
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

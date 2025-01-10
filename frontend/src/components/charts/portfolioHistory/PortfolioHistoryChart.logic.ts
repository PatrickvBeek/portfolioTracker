import { getCashFlowSeries } from "pt-domain/src/portfolio/portfolio.derivers";
import {
  geBuyValueSeriesForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain/src/series/series.derivers";
import { zip } from "radash";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useGetBuyValueSeries = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  return portfolio
    ? removeDuplicatesAtSameTimeStamp(geBuyValueSeriesForPortfolio(portfolio))
    : [];
};

export const useGetCashFlow = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio
    ? removeDuplicatesAtSameTimeStamp(getCashFlowSeries(portfolio))
    : [];
};

export const useGetPortfolioHistoryChartData = (portfolioName: string) => {
  const buyValueSeries = useGetBuyValueSeries(portfolioName);
  const cashFlowSeries = useGetCashFlow(portfolioName);

  return zip(buyValueSeries, cashFlowSeries).reduce<
    { buyValue: number; cashFlow: number; timestamp: number }[]
  >(
    (result, [buyValue, cashFlow]) => [
      ...result,
      {
        buyValue: buyValue.value,
        cashFlow: cashFlow.value,
        timestamp: buyValue.timestamp,
      },
    ],
    []
  );
};

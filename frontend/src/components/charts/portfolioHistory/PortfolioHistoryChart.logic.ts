import { getCashFlowHistory } from "pt-domain/src/portfolio/portfolio.derivers";
import {
  geBuyValueHistoryForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain/src/portfolioHistory/history.derivers";
import { zip } from "radash";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useGetBuyValueHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  return portfolio
    ? removeDuplicatesAtSameTimeStamp(geBuyValueHistoryForPortfolio(portfolio))
    : [];
};

export const useGetCashFlowHistory = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio
    ? removeDuplicatesAtSameTimeStamp(getCashFlowHistory(portfolio))
    : [];
};

export const useGetPortfolioHistoryChartData = (portfolioName: string) => {
  const buyValueHistory = useGetBuyValueHistory(portfolioName);
  const cashFlowHistory = useGetCashFlowHistory(portfolioName);

  if (buyValueHistory.length !== cashFlowHistory.length) {
    return [];
  }

  return zip(buyValueHistory, cashFlowHistory).reduce<
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

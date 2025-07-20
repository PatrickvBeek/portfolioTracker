import {
  getBuyValueHistoryForPortfolio,
  getMarketValueHistory,
  getTotalCashFlowHistory,
  History,
  removeDuplicatesAtSameTimeStamp,
} from "pt-domain";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { usePortfolioPriceData } from "../../chartHooks";
import { ChartDataPoint } from "../../chartTypes";
import { historiesToChartData } from "../../chartUtils";
import { usePortfolioTimeAxis } from "../shared/balancesChart.utils";

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

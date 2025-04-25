import {
  getFirstOrderTimeStamp,
  getIsins,
  getTimeWeightedReturnHistory,
} from "pt-domain/src/portfolio/portfolio.derivers";
import {
  getHistoryPointMapper,
  pickValueFromHistory,
} from "pt-domain/src/portfolioHistory/history.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { last, select } from "radash";
import { useSymbol } from "../../../hooks/assets/assetHooks";
import { usePortfolioSelector } from "../../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
  usePriceQuery,
} from "../../../hooks/prices/priceHooks";
import { ChartData } from "../chartTypes";
import { getDefaultTimeAxis, historiesToChartData } from "../chartUtils";

const useTimeWeightedReturnHistory = (
  portfolioName: string
): CustomQuery<History<number>> | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isins = getIsins(portfolio);
    const priceMapQuery = useGetPricesForIsins(isins);
    const xMin = getFirstOrderTimeStamp(portfolio);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: getTimeWeightedReturnHistory(
        portfolio,
        priceMapQuery.data,
        xMin ? getDefaultTimeAxis(xMin) : undefined
      ).map(getHistoryPointMapper((value) => (value - 1) * 100)),
    };
  });

const usePerformanceBenchmark = (
  portfolioName: string,
  isin: string
): CustomQuery<History<number>> | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const portfolioStartTime = getFirstOrderTimeStamp(portfolio) || -Infinity;
    const symbol = useSymbol(isin);

    return usePriceQuery(symbol, (priceHistory) => {
      // pickValueFromHistory is not used since order timestamps are at
      // start of day and we want to find a point on the same day.
      const startPoint = priceHistory.findLast(
        (p) => p.timestamp >= portfolioStartTime
      );

      if (!startPoint) {
        return [];
      }

      const { timestamp, value } = startPoint;

      return select(
        priceHistory,
        getHistoryPointMapper((p) => (p / value - 1) * 100),
        (p) => p.timestamp >= timestamp
      );
    });
  });

export type PerformanceChartDataSets = "portfolio" | "benchmark";

export const usePerformanceChartData = (
  portfolioName: string,
  benchmarkIsin: string
): ChartData<PerformanceChartDataSets> => {
  const twrHistory = useTimeWeightedReturnHistory(portfolioName)?.data ?? [];
  const benchmarkHistory =
    usePerformanceBenchmark(portfolioName, benchmarkIsin)?.data ?? [];

  const benchmarkStart = last(benchmarkHistory)?.timestamp;
  const twrAtBenchmarkStart =
    benchmarkStart && pickValueFromHistory(twrHistory, benchmarkStart);

  const adjustedTwrHistory = twrAtBenchmarkStart
    ? select(
        twrHistory,
        getHistoryPointMapper((p) => p - twrAtBenchmarkStart.value),
        (p) => p.timestamp >= twrAtBenchmarkStart.timestamp
      )
    : twrHistory;

  return historiesToChartData([
    { history: adjustedTwrHistory, newKey: "portfolio" },
    { history: benchmarkHistory, newKey: "benchmark" },
  ]);
};

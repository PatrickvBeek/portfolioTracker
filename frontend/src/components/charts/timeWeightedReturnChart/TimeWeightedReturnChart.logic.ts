import {
  anchorHistoryToBenchmarkStart,
  anchorHistoryToRangeStart,
  getBenchmarkHistory,
  getFirstOrderTimeStamp,
  History,
  pickValueFromHistory,
} from "pt-domain";
import { min } from "radash";
import { CustomQuery, usePriceQuery } from "../../../hooks/prices/priceHooks";
import { useGetPortfoliosByNames, useSymbol } from "../../../userDataContext";
import { isNotNil } from "../../../utility/types";
import { useTimeWeightedReturnHistory } from "../chartHooks";
import { ChartRange } from "../chartRange.types";
import { ChartData } from "../chartTypes";
import { getRangeStart, historiesToChartData } from "../chartUtils";

const usePerformanceBenchmark = (
  portfolioNames: string[],
  isin: string
): CustomQuery<History<number>> | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const portfolioStartTime =
    min(portfolios.map((p) => getFirstOrderTimeStamp(p)).filter(isNotNil)) ??
    -Infinity;

  const symbol = useSymbol(isin);

  return usePriceQuery(symbol, (priceHistory) =>
    getBenchmarkHistory(priceHistory, portfolioStartTime)
  );
};

export type PerformanceChartDataSets = "portfolio" | "benchmark";

export const usePerformanceChartData = (
  portfolioNames: string[],
  benchmarkIsin: string,
  range: ChartRange
): CustomQuery<ChartData<PerformanceChartDataSets>> => {
  const twrHistoryQuery = useTimeWeightedReturnHistory(portfolioNames, range);
  const benchmarkHistoryQuery = usePerformanceBenchmark(
    portfolioNames,
    benchmarkIsin
  );

  const twrHistory = twrHistoryQuery?.data ?? [];
  const benchmarkHistory = benchmarkHistoryQuery?.data ?? [];

  const adjustedTwrHistory = anchorHistoryToBenchmarkStart(
    twrHistory,
    benchmarkHistory
  );

  const rangeStart = getRangeStart(-Infinity, range);

  const twrAtRangeStart = pickValueFromHistory(adjustedTwrHistory, rangeStart);
  const benchmarkAtRangeStart = pickValueFromHistory(
    benchmarkHistory,
    rangeStart
  );

  const rangeAnchoredTwr = anchorHistoryToRangeStart(
    adjustedTwrHistory,
    twrAtRangeStart,
    rangeStart
  );
  const rangeAnchoredBenchmark = anchorHistoryToRangeStart(
    benchmarkHistory,
    benchmarkAtRangeStart,
    rangeStart
  );

  return {
    isLoading:
      twrHistoryQuery?.isLoading || benchmarkHistoryQuery?.isLoading || false,
    isError:
      twrHistoryQuery?.isError || benchmarkHistoryQuery?.isError || false,
    data: historiesToChartData([
      { history: rangeAnchoredTwr, newKey: "portfolio" },
      { history: rangeAnchoredBenchmark, newKey: "benchmark" },
    ]),
  };
};

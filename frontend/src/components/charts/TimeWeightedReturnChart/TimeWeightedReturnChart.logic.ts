import {
  anchorHistoryToBenchmarkStart,
  anchorHistoryToRangeStart,
  deflateByIndex,
  getBenchmarkHistory,
  getFirstOrderTimeStamp,
  History,
  pickValueFromHistory,
} from "pt-domain";
import { min } from "radash";
import { useInflationIndex } from "../../../hooks/inflation/inflationHooks";
import { CustomQuery, usePriceQuery } from "../../../hooks/prices/priceHooks";
import { useGetPortfoliosByNames, useSymbol } from "../../../userDataContext";
import { isNotNil } from "../../../utility/types";
import {
  useRealTimeWeightedReturnHistory,
  useTimeWeightedReturnHistory,
} from "../chartHooks";
import { ChartRange } from "../chartRange.types";
import { ChartData } from "../chartTypes";
import { getRangeStart, historiesToChartData } from "../chartUtils";

const usePerformanceBenchmark = (
  portfolioNames: string[],
  isin: string,
  mode: TwrMode = "nominal"
): CustomQuery<History<number>> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const portfolioStartTime =
    min(portfolios.map((p) => getFirstOrderTimeStamp(p)).filter(isNotNil)) ??
    -Infinity;

  const symbol = useSymbol(isin);
  const inflationIndexQuery = useInflationIndex(
    portfolioStartTime === -Infinity ? undefined : portfolioStartTime
  );
  const inflationIndex = inflationIndexQuery.data ?? [];

  const priceQuery = usePriceQuery(symbol, (priceHistory) => {
    const realPriceHistory =
      mode === "real" && inflationIndex.length
        ? deflateByIndex(priceHistory, inflationIndex)
        : priceHistory;
    return getBenchmarkHistory(realPriceHistory, portfolioStartTime);
  });

  return {
    isLoading: priceQuery.isLoading || inflationIndexQuery.isLoading,
    isError: priceQuery.isError || inflationIndexQuery.isError,
    data: priceQuery.data,
  };
};

export type PerformanceChartDataSets = "portfolio" | "benchmark";

export type TwrMode = "nominal" | "real";

export const usePerformanceChartData = (
  portfolioNames: string[],
  benchmarkIsin: string,
  range: ChartRange,
  mode: TwrMode = "nominal"
): CustomQuery<ChartData<PerformanceChartDataSets>> => {
  const nominalTwrHistoryQuery = useTimeWeightedReturnHistory(
    portfolioNames,
    range
  );
  const realTwrHistoryQuery = useRealTimeWeightedReturnHistory(
    portfolioNames,
    range
  );
  const twrHistoryQuery =
    mode === "real" ? realTwrHistoryQuery : nominalTwrHistoryQuery;
  const benchmarkHistoryQuery = usePerformanceBenchmark(
    portfolioNames,
    benchmarkIsin,
    mode
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

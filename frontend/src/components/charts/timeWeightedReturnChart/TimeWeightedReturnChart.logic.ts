import {
  getFirstOrderTimeStamp,
  getHistoryPointMapper,
  History,
  pickValueFromHistory,
} from "pt-domain";
import { last, min, select } from "radash";
import { useSymbol } from "../../../hooks/assets/assetHooks";
import { useGetPortfoliosByNames } from "../../../hooks/portfolios/portfolioHooks";
import { CustomQuery, usePriceQuery } from "../../../hooks/prices/priceHooks";
import { isNotNil } from "../../../utility/types";
import {
  percentage2rel,
  rel2percentage,
  useTimeWeightedReturnHistory,
} from "../chartHooks";
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
      getHistoryPointMapper((p) => rel2percentage(p / value)),
      (p) => p.timestamp >= timestamp
    );
  });
};

const anchorHistoryToRangeStart = (
  history: History<number>,
  anchorPoint: History<number>[number] | undefined,
  rangeStart: number
): History<number> =>
  anchorPoint
    ? select(
        history,
        getHistoryPointMapper((p) =>
          rel2percentage(percentage2rel(p) / percentage2rel(anchorPoint.value))
        ),
        (p) => p.timestamp >= rangeStart
      )
    : history.filter((p) => p.timestamp >= rangeStart);

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
  // priceHistory from API is in descending order
  const benchmarkHistory = benchmarkHistoryQuery?.data ?? [];

  const benchmarkStart = last(benchmarkHistory)?.timestamp;
  const twrAtBenchmarkStart =
    benchmarkStart && pickValueFromHistory(twrHistory, benchmarkStart);

  const adjustedTwrHistory = twrAtBenchmarkStart
    ? select(
        twrHistory,
        getHistoryPointMapper((p) =>
          rel2percentage(
            percentage2rel(p) / percentage2rel(twrAtBenchmarkStart.value)
          )
        ),
        (p) => p.timestamp >= twrAtBenchmarkStart.timestamp
      )
    : twrHistory;

  const rangeStart = getRangeStart(-Infinity, range);

  // TWR history is ascending (from domain), benchmark history is descending
  // (from API) — hence the different order modes for pickValueFromHistory.
  const twrAtRangeStart = pickValueFromHistory(
    adjustedTwrHistory,
    rangeStart,
    "ascending"
  );
  const benchmarkAtRangeStart = pickValueFromHistory(
    benchmarkHistory,
    rangeStart,
    "descending"
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

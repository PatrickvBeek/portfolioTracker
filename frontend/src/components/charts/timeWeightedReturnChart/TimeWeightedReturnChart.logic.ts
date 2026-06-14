import {
  getFirstOrderTimeStamp,
  getHistoryPointMapper,
  History,
  pickValueFromHistory,
} from "pt-domain";
import { min, select } from "radash";
import { CustomQuery, usePriceQuery } from "../../../hooks/prices/priceHooks";
import { useGetPortfoliosByNames, useSymbol } from "../../../userDataContext";
import { percentage2rel, rel2percentage } from "../../../utility/percent";
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

  return usePriceQuery(symbol, (priceHistory) => {
    const startPoint = priceHistory.find(
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
  const benchmarkHistory = benchmarkHistoryQuery?.data ?? [];

  const benchmarkStart = benchmarkHistory[0]?.timestamp;
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

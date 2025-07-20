import {
  getFirstOrderTimeStamp,
  getHistoryPointMapper,
  History,
  pickValueFromHistory,
} from "pt-domain";
import { last, select } from "radash";
import { useSymbol } from "../../../hooks/assets/assetHooks";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { CustomQuery, usePriceQuery } from "../../../hooks/prices/priceHooks";
import {
  percentage2rel,
  rel2percentage,
  useTimeWeightedReturnHistory,
} from "../chartHooks";
import { ChartData } from "../chartTypes";
import { historiesToChartData } from "../chartUtils";

const usePerformanceBenchmark = (
  portfolioName: string,
  isin: string
): CustomQuery<History<number>> | undefined => {
  const portfolio = useGetPortfolio(portfolioName);
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
      getHistoryPointMapper((p) => rel2percentage(p / value)),
      (p) => p.timestamp >= timestamp
    );
  });
};

export type PerformanceChartDataSets = "portfolio" | "benchmark";

export const usePerformanceChartData = (
  portfolioName: string,
  benchmarkIsin: string
): CustomQuery<ChartData<PerformanceChartDataSets>> => {
  const twrHistoryQuery = useTimeWeightedReturnHistory(portfolioName);
  const benchmarkHistoryQuery = usePerformanceBenchmark(
    portfolioName,
    benchmarkIsin
  );

  const twrHistory = twrHistoryQuery?.data ?? [];
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

  return {
    isLoading:
      twrHistoryQuery?.isLoading || benchmarkHistoryQuery?.isLoading || false,
    isError:
      twrHistoryQuery?.isError || benchmarkHistoryQuery?.isError || false,
    data: historiesToChartData([
      { history: adjustedTwrHistory, newKey: "portfolio" },
      { history: benchmarkHistory, newKey: "benchmark" },
    ]),
  };
};

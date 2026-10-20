import { applyInflationDiscount, ForecastResult } from "pt-domain";
import { ChartDataPoint } from "./chartTypes";

export type ForecastChartDataSets = "median" | "uncertaintyBand" | "cashFlow";
export type ForecastChartData = ChartDataPoint<ForecastChartDataSets>[];

export const transformForecastToChartData = (
  forecastResult: ForecastResult,
  startTimestamp: number,
  currentCashFlow: number,
  inflationRate: number
): ForecastChartData => {
  const discountedResult = applyInflationDiscount(
    forecastResult,
    inflationRate
  );
  const { median, confidenceLow, confidenceHigh, cashFlows } = discountedResult;
  const monthInMs = 30 * 24 * 60 * 60 * 1000;

  return median.map((_: number, index: number) => ({
    timestamp: startTimestamp + (index + 1) * monthInMs,
    median: median[index],
    uncertaintyBand: [confidenceLow[index], confidenceHigh[index]],
    cashFlow: currentCashFlow + cashFlows[index],
  }));
};

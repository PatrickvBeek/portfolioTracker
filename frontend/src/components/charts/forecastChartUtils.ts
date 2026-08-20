import { applyInflationDiscount, ForecastResult } from "pt-domain";
import { ChartDataPoint } from "./chartTypes";

export type ForecastChartDataSets = "median" | "uncertaintyBand" | "cashFlow";
export type ForecastChartData = ChartDataPoint<ForecastChartDataSets>[];

export const FORECAST_SIMULATION_COUNT = 1000;
export const FORECAST_DEBOUNCE_MS = 500;

const CONTRIBUTION_ROUNDING_STEP = 50;

export const deriveMonthlyContribution = (
  cashFlow: number,
  portfolioAgeYears: number
): number => {
  if (
    !Number.isFinite(cashFlow) ||
    !Number.isFinite(portfolioAgeYears) ||
    portfolioAgeYears <= 0
  ) {
    return 0;
  }

  const monthlyAverage = cashFlow / portfolioAgeYears / 12;
  return Math.max(
    0,
    CONTRIBUTION_ROUNDING_STEP *
      Math.round(monthlyAverage / CONTRIBUTION_ROUNDING_STEP)
  );
};

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

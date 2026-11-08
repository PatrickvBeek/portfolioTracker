import { extent as d3Extent } from "d3-array";
import { scaleLinear as d3LinearScale } from "d3-scale";
import { applyInflationDiscount, ForecastResult } from "pt-domain";
import { YAxisProps } from "recharts";
import { addMonths } from "../../utility/dates";
import { formatAxisValue, getAxisUnit } from "./chartUtils";
import { ChartDataPoint } from "./chartTypes";

export type ForecastChartDataSets = "median" | "uncertaintyBand" | "cashFlow";
export type ForecastChartData = ChartDataPoint<ForecastChartDataSets>[];

export const FORECAST_SIMULATION_COUNT = 1000;
export const FORECAST_DEBOUNCE_MS = 500;

const CONTRIBUTION_ROUNDING_STEP = 50;
const AXIS_HEADROOM = 0.1;
const AXIS_TICK_COUNT = 5;

export type ForecastAxisProps = Omit<
  Partial<YAxisProps>,
  "domain" | "ticks" | "tickFormatter"
> & {
  domain: [number, number];
  ticks: number[];
  tickFormatter: (value: number) => string;
};

const buildNumericAxis = (values: number[]): ForecastAxisProps => {
  const [rawMin, rawMax] = d3Extent(values);
  const min = rawMin ?? 0;
  const max = rawMax ?? 0;
  const bottom = min < 0 ? min * (1 + AXIS_HEADROOM) : 0;
  const top = max > 0 ? max * (1 + AXIS_HEADROOM) : 1;
  const domain: [number, number] = [bottom, top];
  const ticks = d3LinearScale().domain(domain).ticks(AXIS_TICK_COUNT);
  const unit = getAxisUnit(Math.max(Math.abs(bottom), Math.abs(top)));

  return {
    type: "number",
    domain,
    ticks,
    tickFormatter: (value: number) => formatAxisValue(value, unit),
    tick: { fill: "var(--color-text)" },
    axisLine: { stroke: "var(--color-border)" },
    tickLine: { stroke: "var(--color-border)" },
  };
};

export const getForecastYAxisProps = (
  data: ForecastChartData,
  options: { includeCashFlow?: boolean } = {}
): ForecastAxisProps => {
  const values = data.flatMap((point) => {
    const lowerBand = Array.isArray(point.uncertaintyBand)
      ? point.uncertaintyBand[0]
      : undefined;
    const seriesValues = options.includeCashFlow
      ? [point.median, lowerBand, point.cashFlow]
      : [point.median, lowerBand];

    return seriesValues.filter((value): value is number =>
      Number.isFinite(value)
    );
  });

  return buildNumericAxis(values);
};

export const deriveMonthlyContribution = (
  cashFlow: number,
  portfolioAgeYears: number
): number | undefined => {
  if (
    !Number.isFinite(cashFlow) ||
    !Number.isFinite(portfolioAgeYears) ||
    portfolioAgeYears <= 0
  ) {
    return undefined;
  }

  const monthlyAverage = cashFlow / portfolioAgeYears / 12;
  return Math.max(
    0,
    CONTRIBUTION_ROUNDING_STEP *
      Math.round(monthlyAverage / CONTRIBUTION_ROUNDING_STEP)
  );
};

export const buildForecastChartData = (
  discountedResult: ForecastResult,
  startTimestamp: number,
  currentCashFlow: number
): ForecastChartData => {
  const { median, confidenceLow, confidenceHigh, cashFlows } = discountedResult;

  return median.map((_: number, index: number) => ({
    timestamp: addMonths(startTimestamp, index + 1).getTime(),
    median: median[index],
    uncertaintyBand: [confidenceLow[index], confidenceHigh[index]],
    cashFlow: currentCashFlow + cashFlows[index],
  }));
};

export const transformForecastToChartData = (
  forecastResult: ForecastResult,
  startTimestamp: number,
  currentCashFlow: number,
  inflationRate: number
): ForecastChartData =>
  buildForecastChartData(
    applyInflationDiscount(forecastResult, inflationRate),
    startTimestamp,
    currentCashFlow
  );

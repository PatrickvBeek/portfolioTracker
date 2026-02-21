export const CHART_RANGES = {
  "1M": "1M",
  "3M": "3M",
  "1Y": "1Y",
  "3Y": "3Y",
  "10Y": "10Y",
  Max: "Max",
} as const;

export type ChartRange = keyof typeof CHART_RANGES;

export const CHART_RANGE_DAYS: Record<ChartRange, number | null> = {
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  "3Y": 1095,
  "10Y": 3650,
  Max: null,
};

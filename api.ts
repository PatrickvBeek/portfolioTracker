import { Series } from "./domain/src/series/series.entities";

export const PRICE_FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
export type PriceFrequency =
  (typeof PRICE_FREQUENCY)[keyof typeof PRICE_FREQUENCY];

export type PriceQueryParams = { symbol: string; frequency: PriceFrequency };

export type PriceResponse = Series<number>;

import { useQuery } from "react-query";
import { Series } from "../../../../domain/src/series/series.entities";

export const PRICE_FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
export type PriceFrequency =
  (typeof PRICE_FREQUENCY)[keyof typeof PRICE_FREQUENCY];

type PriceQuery = { symbol: string; frequency: PriceFrequency };

export const useFetchPrices = (params: PriceQuery) => {
  return useQuery(`prices-${JSON.stringify(params)}`, async () =>
    fetchPrices(params)
  );
};

const fetchPrices = async (
  params: PriceQuery
): Promise<Series<number> | undefined> => {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/prices?${query.toString()}`).catch();
  return response.json();
};

import { Series } from "pt-domain/src/series/series.entities";
import { useQuery } from "react-query";
import { useGetAssets } from "../assets/assetHooks";

export type PriceQuery = {
  isLoading: boolean;
  isError: boolean;
  data: number | undefined;
};

export const usePriceQuery = <T>(
  params: PriceQueryParams,
  selector?: (
    prices: Awaited<ReturnType<typeof getPricesFromAlphaVantage>>
  ) => T
) => {
  return useQuery({
    queryKey: `prices-${params.symbol}-${params.frequency}`,
    queryFn: async () => getPricesFromAlphaVantage(params),
    select: selector,
    retry: false,
  });
};

export const useCurrentPrice = (symbol: PriceQueryParams["symbol"]) =>
  usePriceQuery(
    { symbol, frequency: PRICE_FREQUENCY.WEEKLY },
    (prices = []) => prices.at(0)?.value
  );

export const useCurrentPriceByIsin = (isin: string) => {
  const assetLib = useGetAssets();
  const symbol = assetLib?.[isin]?.symbol;

  return useCurrentPrice(symbol || "");
};

const getPricesFromAlphaVantage = async (
  params: PriceQueryParams
): Promise<Series<number> | undefined> => {
  if (!params.symbol) {
    return undefined;
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${params.symbol}&outputsize=full&apikey=free_tier`
  );
  const prices = await response.json();

  return Object.entries(prices["Time Series (Daily)"]).map(
    ([dateString, price]) => ({
      timestamp: new Date(dateString).getTime(),
      value: parseFloat((price as any)["4. close"]),
    })
  );
};

const PRICE_FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
type PriceFrequency = (typeof PRICE_FREQUENCY)[keyof typeof PRICE_FREQUENCY];

type PriceQueryParams = { symbol: string; frequency: PriceFrequency };

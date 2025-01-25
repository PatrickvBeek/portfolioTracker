import { useQueries, useQuery } from "@tanstack/react-query";
import { zipToObject } from "radash";
import { useGetSymbol } from "../assets/assetHooks";
import { getPricesFromAlphaVantage } from "./alphaVantage";

const PRICE_BASE_QUERY_KEY = "prices";

export type PriceQuery = {
  isLoading: boolean;
  isError: boolean;
  data: number | undefined;
};

export const usePriceQuery = <T>(
  symbol: string,
  selector?: (
    prices: Awaited<ReturnType<typeof getPricesFromAlphaVantage>>
  ) => T
) => {
  return useQuery({
    queryKey: [PRICE_BASE_QUERY_KEY, symbol],
    queryFn: async () => getPricesFromAlphaVantage(symbol),
    select: selector,
    retry: false,
  });
};

export const useCurrentPrice = (symbol: string) =>
  usePriceQuery(symbol, (prices = []) => prices.at(0)?.value);

export const useCurrentPriceByIsin = (isin: string) =>
  useCurrentPrice(useGetSymbol(isin) || "");

export const useGetPricesForIsins = (isins: string[]) => {
  return useQueries({
    queries: isins.map((isin) => {
      const symbol = useGetSymbol(isin) || "";
      return {
        queryKey: [PRICE_BASE_QUERY_KEY, symbol],
        queryFn: async () => getPricesFromAlphaVantage(symbol),
        staleTime: Infinity,
        retry: false,
      };
    }),
    combine: (results) => ({
      isError: results.some((result) => result.isError),
      isLoading: results.some((result) => result.isLoading),
      data: zipToObject(
        isins,
        results.map((result) => result.data || [])
      ),
    }),
  });
};

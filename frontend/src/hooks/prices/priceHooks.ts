import { useQueries, useQuery } from "@tanstack/react-query";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { unique, zipToObject } from "radash";
import { useGetApiKeys } from "../apiKeys/apiKeyHooks";
import { useGetAssets, useSymbol } from "../assets/assetHooks";
import { getPricesFromAlphaVantage } from "./alphaVantage";
import { getPricesFromYahooFinance } from "./yahooFinance";

const PRICE_BASE_QUERY_KEY = "prices";

export type CustomQuery<T = number> = {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
};

const useGetPriceProvider = () => {
  const yhKey = useGetApiKeys()?.yahoo;

  return yhKey ? getPricesFromYahooFinance(yhKey) : getPricesFromAlphaVantage;
};

export const usePriceQuery = <T>(
  symbol: string,
  selector?: (prices: History<number>) => T
) => {
  const fetchingFunction = useGetPriceProvider();
  return useQuery({
    queryKey: [PRICE_BASE_QUERY_KEY, symbol],
    queryFn: async () => fetchingFunction(symbol),
    select: selector,
    retry: false,
  });
};

export const useCurrentPrice = (symbol: string) =>
  usePriceQuery(symbol, (prices = []) => prices.at(0)?.value);

export const useCurrentPriceByIsin = (isin: string) =>
  useCurrentPrice(useSymbol(isin));

export const useGetPricesForIsins = (isins: string[]) => {
  const assets = useGetAssets() || {};
  const fetchingFunction = useGetPriceProvider();
  const symbols = unique(
    isins.map((i) => assets[i]?.symbol || "").filter((s) => s.length > 0)
  );

  return useQueries({
    queries: symbols.map((symbol) => {
      return {
        queryKey: [PRICE_BASE_QUERY_KEY, symbol],
        queryFn: async () => fetchingFunction(symbol),
        staleTime: Infinity,
        retry: false,
      };
    }),
    combine: (results) => {
      const priceResults = zipToObject(
        symbols,
        results.map((result) => result.data || [])
      );

      return {
        isError: results.some((result) => result.isError),
        isLoading: results.some((result) => result.isLoading),
        data: Object.fromEntries(
          isins.map((isin) => [
            isin,
            priceResults[assets[isin].symbol || ""] || [],
          ])
        ),
      };
    },
  });
};

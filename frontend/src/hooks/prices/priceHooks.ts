import { useQuery } from "react-query";
import { PRICE_FREQUENCY, PriceQueryParams } from "../../../../api";
import { Series } from "../../../../domain/src/series/series.entities";
import { useGetAssets } from "../assets/assetHooks";

export type PriceQuery = {
  isLoading: boolean;
  isError: boolean;
  data: number | undefined;
};

export const usePriceQuery = <T>(
  params: PriceQueryParams,
  selector?: (prices: Awaited<ReturnType<typeof fetchPrices>>) => T,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: `prices-${params.symbol}-${params.frequency}`,
    queryFn: async () => fetchPrices(params),
    select: selector,
    retry: false,
    enabled,
  });
};

export const useCurrentPrice = (
  symbol: PriceQueryParams["symbol"],
  enabled?: boolean
) =>
  usePriceQuery(
    { symbol, frequency: PRICE_FREQUENCY.WEEKLY },
    (prices = []) => prices.at(0)?.value,
    enabled
  );

export const useCurrentPriceByIsin = (isin: string) => {
  const assetLib = useGetAssets();
  const symbol = assetLib?.[isin]?.symbol;
  const priceQuery = useCurrentPrice(symbol || "", !!assetLib);

  return priceQuery;
};

const fetchPrices = async (
  params: PriceQueryParams
): Promise<Series<number> | undefined> => {
  if (!params.symbol) {
    return undefined;
  }

  const query = new URLSearchParams(params);
  const response = await fetch(`/api/prices?${query.toString()}`).catch();
  return response.json();
};

import { useQuery } from "react-query";
import { PriceQueryParams } from "../../../../api";
import { Series } from "../../../../domain/src/series/series.entities";

export const useFetchPrices = (params: PriceQueryParams) => {
  return useQuery({
    queryKey: `prices-${JSON.stringify(params)}`,
    queryFn: async () => fetchPrices(params),
    retry: false,
  });
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

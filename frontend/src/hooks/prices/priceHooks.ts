import { useQuery } from "react-query";
import { PriceQueryParams } from "../../../../api";
import { Series } from "../../../../domain/src/series/series.entities";

export const useFetchPrices = (params: PriceQueryParams) => {
  return useQuery(`prices-${JSON.stringify(params)}`, async () =>
    fetchPrices(params)
  );
};

const fetchPrices = async (
  params: PriceQueryParams
): Promise<Series<number> | undefined> => {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/prices?${query.toString()}`).catch();
  return response.json();
};

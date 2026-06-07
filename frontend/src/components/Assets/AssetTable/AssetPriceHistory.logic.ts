import { History, getAssetReturnAndVolatility } from "pt-domain";
import { useMemo } from "react";
import { usePriceQuery } from "../../../hooks/prices/priceHooks";
import { CHART_RANGE_DAYS, ChartRange } from "../../charts/chartRange.types";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function getFilteredPriceHistory(
  prices: History<number> | undefined,
  range: ChartRange
) {
  const filtered = filterByRange(prices ?? [], range);
  const baseline =
    filtered.length > 0 ? filtered[filtered.length - 1].value : 0;

  return { data: filtered, baseline };
}

function filterByRange(
  prices: History<number>,
  range: ChartRange
): History<number> {
  if (prices.length === 0) {
    return [];
  }

  const days = CHART_RANGE_DAYS[range];
  if (days == null) {
    return prices;
  }

  const cutoff = Date.now() - days * DAY_IN_MS;
  return prices.filter((p) => p.timestamp >= cutoff);
}

export function useAssetPriceChartData(
  symbol: string | undefined,
  range: ChartRange
) {
  const priceQuery = usePriceQuery<History<number>>(symbol ?? "", undefined, {
    enabled: !!symbol,
  });

  const { data, baseline } = useMemo(
    () => getFilteredPriceHistory(priceQuery.data, range),
    [priceQuery.data, range]
  );

  const stats = useMemo(() => getAssetReturnAndVolatility(data), [data]);

  return {
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    data,
    baseline,
    stats,
  };
}

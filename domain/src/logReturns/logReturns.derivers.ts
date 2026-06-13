import { History } from "../portfolioHistory/history.entities";
import { AssetReturnAndVolatility } from "./logReturns.entities";
import { getLogReturnStats } from "./logReturns.operations";

export const getAssetReturnAndVolatility = (
  prices: History<number>
): AssetReturnAndVolatility | undefined => {
  const stats = getLogReturnStats(prices);
  if (!stats) {
    return undefined;
  }

  const ratio =
    stats.annualizedVolatility > 1e-10
      ? stats.annualizedReturn / stats.annualizedVolatility
      : NaN;

  return {
    annualizedReturn: stats.annualizedReturn,
    annualizedVolatility: stats.annualizedVolatility,
    ratio,
  };
};

import {
  BatchType,
  getAssetsForBatchType,
  getCurrentValueOfOpenBatches,
  getLatestPriceFromTransactions,
  getNonRealizedGainsForIsin,
  getPiecesOfIsinInPortfolio,
  getRealizedGainsForIsin,
  getSoldValueOfClosedBatches,
} from "pt-domain";
import { sort, sum } from "radash";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { useCurrentPriceByIsin } from "../../../hooks/prices/priceHooks";

export function useGetPositionListItems(
  portfolioName: string,
  batchType: BatchType
): string[] | undefined {
  const portfolio = useGetPortfolio(portfolioName);

  if (!portfolio) {
    return undefined;
  }
  const isins = getAssetsForBatchType(portfolio, batchType);

  return sort(
    isins,
    (isin) => {
      const currentPrice =
        getLatestPriceFromTransactions(portfolio, isin) ?? NaN;
      return batchType === "open"
        ? getCurrentValueOfOpenBatches(portfolio, isin, currentPrice)
        : getSoldValueOfClosedBatches(portfolio, isin);
    },
    true
  );
}

const useGetAssetsForBatchType = (
  portfolioName: string,
  batchType: BatchType
) => getAssetsForBatchType(useGetPortfolio(portfolioName), batchType);

export const useGetPositionPieces = (
  portfolioName: string,
  isin: string,
  batchType: BatchType
) =>
  getPiecesOfIsinInPortfolio(useGetPortfolio(portfolioName), isin, batchType);

export const useGetTotalPositionValue = (
  portfolioName: string,
  isin: string,
  batchType: BatchType
) => {
  const portfolio = useGetPortfolio(portfolioName);
  const priceQuery = useCurrentPriceByIsin(isin);
  const currentPrice =
    priceQuery.data ?? getLatestPriceFromTransactions(portfolio, isin) ?? NaN;

  const positionValue =
    batchType === "open"
      ? getCurrentValueOfOpenBatches(portfolio, isin, currentPrice)
      : getSoldValueOfClosedBatches(portfolio, isin);

  return {
    ...priceQuery,
    data: positionValue,
  };
};

export const useGetRealizedPositionGains = (
  portfolioName: string,
  isin: string
) => getRealizedGainsForIsin(useGetPortfolio(portfolioName), isin);

export const useGetNonRealizedPositionGains = (
  portfolioName: string,
  isin: string
) => {
  const portfolio = useGetPortfolio(portfolioName);
  const onlinePriceQuery = useCurrentPriceByIsin(isin);
  const currentPrice =
    onlinePriceQuery.data ??
    getLatestPriceFromTransactions(portfolio, isin) ??
    NaN;

  const gains = getNonRealizedGainsForIsin(portfolio, isin, currentPrice);

  return {
    ...onlinePriceQuery,
    data: gains,
  };
};

export const useGetPositionProfit = (portfolioName: string, isin: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  const currentPriceQuery = useCurrentPriceByIsin(isin);

  const currentPrice =
    currentPriceQuery.data ??
    getLatestPriceFromTransactions(portfolio, isin) ??
    NaN;

  const nonRealizedGains = getNonRealizedGainsForIsin(
    portfolio,
    isin,
    currentPrice
  );
  const realizedGains = getRealizedGainsForIsin(portfolio, isin);

  const gains = realizedGains + nonRealizedGains;

  return {
    ...currentPriceQuery,
    data: gains,
  };
};

export const usePositionListSum = (
  portfolioName: string,
  batchType: BatchType,
  selector: (
    portfolioName: string,
    isin: string,
    batchType: BatchType
  ) => number | undefined
): number => {
  const isins = useGetAssetsForBatchType(portfolioName, batchType);
  return (
    isins &&
    sum(isins.map((isin) => selector(portfolioName, isin, batchType) || 0))
  );
};

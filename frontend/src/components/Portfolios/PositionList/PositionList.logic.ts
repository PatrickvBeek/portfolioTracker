import { sort, sum } from "radash";
import { UseQueryResult } from "react-query";
import { BatchType } from "../../../../../domain/src/batch/batch.entities";
import {
  getAssetsForBatchType,
  getCurrentValueOfOpenBatches,
  getLatestPriceFromTransactions,
  getNonRealizedGainsForIsin,
  getPiecesOfIsinInPortfolio,
  getRealizedGainsForIsin,
  getSoldValueOfClosedBatches,
} from "../../../../../domain/src/portfolio/portfolio.derivers";
import {
  useGetPortfolio,
  usePortfolioQuery,
} from "../../../hooks/portfolios/portfolioHooks";

export function useGetPositionListItems(
  portfolioName: string,
  batchType: BatchType
): string[] | undefined {
  const portfolioQuery = useGetPortfolio(portfolioName);

  if (!portfolioQuery.data) {
    return undefined;
  }
  const portfolio = portfolioQuery.data;

  const isins = getAssetsForBatchType(portfolioQuery.data, batchType);

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
) =>
  usePortfolioQuery(portfolioName, (p) => getAssetsForBatchType(p, batchType));

export const useGetPositionPieces = (
  portfolioName: string,
  isin: string,
  batchType: BatchType
) =>
  usePortfolioQuery(portfolioName, (p): number =>
    getPiecesOfIsinInPortfolio(p, isin, batchType)
  );

export const useGetTotalPositionValue = (
  portfolioName: string,
  isin: string,
  batchType: BatchType
) =>
  usePortfolioQuery(portfolioName, (p): number => {
    const currentPrice = getLatestPriceFromTransactions(p, isin) ?? NaN;

    return batchType === "open"
      ? getCurrentValueOfOpenBatches(p, isin, currentPrice)
      : getSoldValueOfClosedBatches(p, isin);
  });

export const useGetRealizedPositionGains = (
  portfolioName: string,
  isin: string
) =>
  usePortfolioQuery(portfolioName, (p): number =>
    getRealizedGainsForIsin(p, isin)
  );

export const useGetNonRealizedPositionGains = (
  portfolioName: string,
  isin: string
) =>
  usePortfolioQuery(portfolioName, (p): number => {
    const currentPrice = getLatestPriceFromTransactions(p, isin) ?? NaN;

    return getNonRealizedGainsForIsin(p, isin, currentPrice);
  });

export const useGetPositionProfit = (portfolioName: string, isin: string) =>
  usePortfolioQuery(portfolioName, (p): number => {
    const currentPrice = getLatestPriceFromTransactions(p, isin) ?? NaN;

    const nonRealizedGains = getNonRealizedGainsForIsin(p, isin, currentPrice);
    const realizedGains = getRealizedGainsForIsin(p, isin);

    return realizedGains + nonRealizedGains;
  });

export const usePositionListSum = (
  portfolioName: string,
  batchType: BatchType,
  selector: (
    portfolioName: string,
    isin: string,
    batchType: BatchType
  ) => UseQueryResult<number>
): number | undefined => {
  const isins = useGetAssetsForBatchType(portfolioName, batchType).data;
  return (
    isins &&
    sum(isins.map((isin) => selector(portfolioName, isin, batchType).data || 0))
  );
};

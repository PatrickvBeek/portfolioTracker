import { AssetLibrary } from "../../../../../../domain/src/asset/asset.entities";
import { BatchType } from "../../../../../../domain/src/batch/batch.entities";
import {
  getBatchesForIsin,
  getCurrentValueOfOpenBatches,
  getLatestPriceFromTransactions,
  getNonRealizedGainsForIsin,
  getPiecesOfIsinInPortfolio,
  getRealizedGainsForIsin,
  getSoldValueOfClosedBatches,
} from "../../../../../../domain/src/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../../../domain/src/portfolio/portfolio.entities";
import { isFloatPositive } from "../../../../../../domain/src/utils/floats";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import {
  useGetPortfolio,
  usePortfolioQuery,
} from "../../../../hooks/portfolios/portfolioHooks";
import { PositionsListItem } from "../PositionList";

export function useGetPositionListItems(
  portfolio: string,
  batchType: BatchType
) {
  const portfolioQuery = useGetPortfolio(portfolio);
  const assetQuery = useGetAssets();

  return getPositionListItems(portfolioQuery.data, assetQuery.data, batchType);
}

function getPositionListItems(
  portfolio: Portfolio | undefined,
  assets: AssetLibrary | undefined,
  batchType: BatchType
): PositionsListItem[] | undefined {
  if (!(assets && portfolio)) {
    return undefined;
  }
  return Object.keys(portfolio.orders)
    .filter((isin) => isIsinOfBatchType(portfolio, isin, batchType))
    .map((isin) => {
      const currentPrice =
        getLatestPriceFromTransactions(portfolio, isin) ?? NaN;
      const realizedGains = getRealizedGainsForIsin(portfolio, isin);
      const nonRealizedGains = getNonRealizedGainsForIsin(
        portfolio,
        isin,
        currentPrice
      );

      return {
        totalValue:
          batchType === "open"
            ? getCurrentValueOfOpenBatches(portfolio, isin, currentPrice)
            : getSoldValueOfClosedBatches(portfolio, isin),
        realizedGains,
        nonRealizedGains,
        profit: nonRealizedGains + realizedGains,
        batches: getBatchesForIsin(portfolio, isin),
        isin,
      };
    })
    .toSorted((a, b) => b.totalValue - a.totalValue);
}

const isIsinOfBatchType = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType
): boolean => {
  const isOpen = isFloatPositive(
    getPiecesOfIsinInPortfolio(portfolio, isin, "open")
  );

  return batchType === "open" ? isOpen : !isOpen;
};

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

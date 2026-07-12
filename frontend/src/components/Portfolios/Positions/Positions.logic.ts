import {
  BatchType,
  EMPTY_POSITION_SUMMARY,
  getAssetsForBatchType,
  getCurrentValueOfOpenBatches,
  getLatestPriceFromTransactions,
  getNonRealizedGainsForIsin,
  getPiecesOfIsinInPortfolio,
  getPositionSummary,
  getRealizedGainsForIsin,
  getSoldValueOfClosedBatches,
  PositionSummary,
} from "pt-domain";
import { sort } from "radash";
import { useGetPortfolio } from "../../../userDataContext";
import {
  useCurrentPriceByIsin,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";

type PositionData = {
  pieces: number;
  totalValue: { data: number | undefined; isLoading: boolean };
  realizedGains: number;
  nonRealizedGains: { data: number | undefined; isLoading: boolean };
  profit: { data: number | undefined; isLoading: boolean };
};

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

export function usePositionData(
  portfolioName: string,
  isin: string,
  batchType: BatchType
): PositionData {
  const portfolio = useGetPortfolio(portfolioName);
  const priceQuery = useCurrentPriceByIsin(isin);

  const currentPrice =
    priceQuery.data ?? getLatestPriceFromTransactions(portfolio, isin) ?? NaN;

  const pieces = getPiecesOfIsinInPortfolio(portfolio, isin, batchType);
  const positionValue =
    batchType === "open"
      ? getCurrentValueOfOpenBatches(portfolio, isin, currentPrice)
      : getSoldValueOfClosedBatches(portfolio, isin);
  const realizedGains = getRealizedGainsForIsin(portfolio, isin);
  const nonRealized = getNonRealizedGainsForIsin(portfolio, isin, currentPrice);
  const profitValue = realizedGains + nonRealized;

  return {
    pieces,
    totalValue: { data: positionValue, isLoading: priceQuery.isLoading },
    realizedGains,
    nonRealizedGains: { data: nonRealized, isLoading: priceQuery.isLoading },
    profit: { data: profitValue, isLoading: priceQuery.isLoading },
  };
}

export function usePositionSummary(
  portfolioName: string,
  batchType: BatchType
): PositionSummary {
  const portfolio = useGetPortfolio(portfolioName);
  const isins = portfolio
    ? getAssetsForBatchType(portfolio, batchType)
    : undefined;
  const pricesQuery = useGetPricesForIsins(isins || []);

  if (!isins || !portfolio) {
    return EMPTY_POSITION_SUMMARY;
  }

  return getPositionSummary(
    portfolio,
    isins,
    batchType,
    pricesQuery.data || {}
  );
}

import {
  ClosedBatch,
  getLatestPriceFromTransactions,
  getPortfolioBatchesOfType,
  getProfitForClosedBatch,
  OpenBatch,
} from "pt-domain";
import { sum } from "radash";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { useCurrentPriceByIsin } from "../../../hooks/prices/priceHooks";

const sumBy = <T extends OpenBatchListItem | ClosedBatchListItem>(
  batches: T[],
  key: keyof T
): number => sum(batches, (batch) => Number(batch[key]));

export type OpenBatchListItem = {
  buyDate: OpenBatch["buyDate"];
  pieces: number;
  buyPrice: number;
  buyValue: number;
  currentValue: number;
  fees: OpenBatch["orderFee"];
  pendingGrosProfit: number;
};

export type ClosedBatchListItem = {
  buyDate: ClosedBatch["buyDate"];
  pieces: number;
  buyValue: number;
  sellValue: number;
  fees: ClosedBatch["orderFee"];
  taxes: ClosedBatch["taxes"];
  netProfit: number;
};

export type OpenBatchTotals = {
  totalPieces: number;
  totalBuyValue: number;
  totalCurrentValue: number;
  totalFees: number;
  totalProfit: number;
};

export type ClosedBatchTotals = {
  totalPieces: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalFees: number;
  totalTaxes: number;
  totalNetProfit: number;
};

function useGetOpenBatchesListItems(
  portfolioName: string,
  isin: string
): OpenBatchListItem[] | undefined {
  const portfolio = useGetPortfolio(portfolioName);
  const priceQuery = useCurrentPriceByIsin(isin);

  if (!portfolio || priceQuery.isLoading) {
    return undefined;
  }

  const currentPrice =
    priceQuery.data ?? getLatestPriceFromTransactions(portfolio, isin) ?? NaN;

  return getPortfolioBatchesOfType(portfolio, isin, "open").map(
    ({ buyDate, pieces, buyPrice, orderFee }) => ({
      buyDate,
      pieces,
      buyPrice,
      buyValue: pieces * buyPrice,
      currentValue: pieces * currentPrice,
      fees: orderFee,
      pendingGrosProfit: pieces * (currentPrice - buyPrice),
    })
  );
}

function useGetClosedBatchesListItems(
  portfolioName: string,
  isin: string
): ClosedBatchListItem[] | undefined {
  const portfolio = useGetPortfolio(portfolioName);

  if (!portfolio) {
    return undefined;
  }

  return getPortfolioBatchesOfType(portfolio, isin, "closed").map((batch) => ({
    buyDate: batch.buyDate,
    pieces: batch.pieces,
    buyValue: batch.pieces * batch.buyPrice,
    sellValue: batch.pieces * batch.sellPrice,
    fees: batch.orderFee,
    taxes: batch.taxes,
    netProfit: getProfitForClosedBatch(batch),
  }));
}

export function useGetOpenBatchesWithTotals(
  portfolioName: string,
  isin: string
): { batches: OpenBatchListItem[]; totals: OpenBatchTotals } | undefined {
  const batches = useGetOpenBatchesListItems(portfolioName, isin);

  if (!batches) {
    return undefined;
  }

  return {
    batches,
    totals: {
      totalPieces: sumBy(batches, "pieces"),
      totalBuyValue: sumBy(batches, "buyValue"),
      totalCurrentValue: sumBy(batches, "currentValue"),
      totalFees: sumBy(batches, "fees"),
      totalProfit: sumBy(batches, "pendingGrosProfit"),
    },
  };
}

export function useGetClosedBatchesWithTotals(
  portfolioName: string,
  isin: string
): { batches: ClosedBatchListItem[]; totals: ClosedBatchTotals } | undefined {
  const batches = useGetClosedBatchesListItems(portfolioName, isin);

  if (!batches) {
    return undefined;
  }

  return {
    batches,
    totals: {
      totalPieces: sumBy(batches, "pieces"),
      totalBuyValue: sumBy(batches, "buyValue"),
      totalSellValue: sumBy(batches, "sellValue"),
      totalFees: sumBy(batches, "fees"),
      totalTaxes: sumBy(batches, "taxes"),
      totalNetProfit: sumBy(batches, "netProfit"),
    },
  };
}

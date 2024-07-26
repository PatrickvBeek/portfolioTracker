import { getProfitForClosedBatch } from "../../../../../domain/src/batch/batch.derivers";
import {
  ClosedBatch,
  OpenBatch,
} from "../../../../../domain/src/batch/batch.entities";
import {
  getLatestPriceFromTransactions,
  getPortfolioBatchesOfType,
} from "../../../../../domain/src/portfolio/portfolio.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

type OpenBatchListItem = {
  buyDate: OpenBatch["buyDate"];
  pieces: number;
  buyValue: number;
  currentValue: number;
  fees: OpenBatch["orderFee"];
  pendingGrosProfit: number;
};

export function useGetOpenBatchesListItems(
  portfolioName: string,
  isin: string
): OpenBatchListItem[] | undefined {
  const portfolioQuery = useGetPortfolio(portfolioName);

  if (!portfolioQuery.data) {
    return undefined;
  }

  const currentPrice =
    getLatestPriceFromTransactions(portfolioQuery.data, isin) ?? NaN;

  return getPortfolioBatchesOfType(portfolioQuery.data, isin, "open").map(
    ({ buyDate, pieces, buyPrice, orderFee }) => ({
      buyDate,
      pieces,
      buyValue: pieces * buyPrice,
      currentValue: pieces * currentPrice,
      fees: orderFee,
      pendingGrosProfit: pieces * (currentPrice - buyPrice),
    })
  );
}

type ClosedBatchListItem = {
  buyDate: ClosedBatch["buyDate"];
  pieces: number;
  buyValue: number;
  sellValue: number;
  fees: ClosedBatch["orderFee"];
  taxes: ClosedBatch["taxes"];
  netProfit: number;
};

export function useGetClosedBatchesListItems(
  portfolioName: string,
  isin: string
): ClosedBatchListItem[] | undefined {
  const portfolioQuery = useGetPortfolio(portfolioName);

  if (!portfolioQuery.data) {
    return undefined;
  }

  return getPortfolioBatchesOfType(portfolioQuery.data, isin, "closed").map(
    (batch) => ({
      buyDate: batch.buyDate,
      pieces: batch.pieces,
      buyValue: batch.pieces * batch.buyPrice,
      sellValue: batch.pieces * batch.sellPrice,
      fees: batch.orderFee,
      taxes: batch.taxes,
      netProfit: getProfitForClosedBatch(batch),
    })
  );
}

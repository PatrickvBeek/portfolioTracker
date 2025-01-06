import { getProfitForClosedBatch } from "pt-domain/src/batch/batch.derivers";
import { ClosedBatch, OpenBatch } from "pt-domain/src/batch/batch.entities";
import {
  getLatestPriceFromTransactions,
  getPortfolioBatchesOfType,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { useCurrentPriceByIsin } from "../../../hooks/prices/priceHooks";

export type OpenBatchListItem = {
  buyDate: OpenBatch["buyDate"];
  pieces: number;
  buyPrice: number;
  buyValue: number;
  currentValue: number;
  fees: OpenBatch["orderFee"];
  pendingGrosProfit: number;
};

export function useGetOpenBatchesListItems(
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

export type ClosedBatchListItem = {
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

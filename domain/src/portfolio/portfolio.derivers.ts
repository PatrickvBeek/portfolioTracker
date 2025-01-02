import { partial, sort, sum } from "radash";
import { getNumericDateTime, isOrder } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  getBatches,
  getBatchesAtTimeStamp,
  getBatchesOfType,
  getProfitForClosedBatch,
  getProfitForOpenBatch,
} from "../batch/batch.derivers";
import { BatchType, Batches } from "../batch/batch.entities";
import { getDividendNetVolume } from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { areOrdersEqualOnDay } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { isFloatPositive } from "../utils/floats";
import { Portfolio } from "./portfolio.entities";

const getOrdersForIsin = (portfolio: Portfolio, isin: string): Order[] =>
  portfolio.orders[isin] || [];

const getDividendPayoutsForIsin = (
  portfolio: Portfolio,
  isin: string
): DividendPayout[] => portfolio.dividendPayouts[isin] || [];

export const getPortfolioBatchesOfType = <T extends BatchType>(
  portfolio: Portfolio,
  isin: string,
  batchType: T
): Batches[T] =>
  getBatchesOfType(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin),
    batchType
  );

export const getBatchesForIsin = (
  portfolio: Portfolio,
  isin: string
): Batches | undefined =>
  getBatches(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin)
  );

const getAllOrdersInPortfolio = (portfolio: Portfolio): Order[] =>
  Object.values(portfolio.orders).flat();

export const getAssetsForBatchType = (
  portfolio: Portfolio,
  batchType: BatchType
): string[] =>
  Object.keys(portfolio.orders).filter(
    partial(isIsinOfBatchType, portfolio, batchType)
  );

const isIsinOfBatchType = (
  portfolio: Portfolio,
  batchType: BatchType,
  isin: string
): boolean => {
  const isOpen = isFloatPositive(
    getPiecesOfIsinInPortfolio(portfolio, isin, "open")
  );

  return batchType === "open" ? isOpen : !isOpen;
};

const getAllDividendPayoutsInPortfolio = (
  portfolio: Portfolio
): DividendPayout[] => Object.values(portfolio.dividendPayouts).flat();

export const getActivitiesForPortfolio = (
  portfolio: Portfolio
): PortfolioActivity[] =>
  sort(
    [
      ...getAllOrdersInPortfolio(portfolio),
      ...getAllDividendPayoutsInPortfolio(portfolio),
    ],
    getNumericDateTime
  );

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType = "open"
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, batchType),
    (pos) => pos.pieces
  );

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType | "both"
): number => {
  const batches = getBatches(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin)
  );
  if (!batches) {
    return 0;
  }
  const fees = {
    ...batches,
    both: batches.open.concat(batches.closed),
  };

  return sum(fees[batchType], (pos) => pos.orderFee);
};

export const getSoldValueOfClosedBatches = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, "closed"),
    (p) => p.sellPrice * p.pieces
  );

export const getRealizedGainsForIsin = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, "closed"),
    getProfitForClosedBatch
  ) + getDividendSum(portfolio, isin);

export function getNonRealizedGainsForIsin(
  portfolio: Portfolio,
  isin: string,
  currentPrice: number
): number {
  return sum(getPortfolioBatchesOfType(portfolio, isin, "open"), (batch) =>
    getProfitForOpenBatch(batch, currentPrice)
  );
}

export const portfolioContainsOrder = (
  portfolio: Portfolio,
  order: Order
): boolean => {
  return getOrdersForIsin(portfolio, order.asset).some((o) =>
    areOrdersEqualOnDay(o, order)
  );
};

export const isOrderValidForPortfolio = (
  portfolio: Portfolio,
  order: Order
): boolean => {
  const positionsAtOrderDate = getBatchesAtTimeStamp(
    getOrdersForIsin(portfolio, order.asset),
    getNumericDateTime(order)
  );
  const piecesAvailable = sum(positionsAtOrderDate.open, (pos) => pos.pieces);
  return piecesAvailable + order.pieces >= 0;
};

export const getDividendSum = (portfolio: Portfolio, isin: string): number =>
  sum(getDividendPayoutsForIsin(portfolio, isin).map(getDividendNetVolume));

export const getLatestPriceFromTransactions = (
  portfolio: Portfolio,
  isin: string
): number | undefined =>
  getActivitiesForPortfolio(portfolio)
    .filter((a) => a.asset === isin)
    .filter((a) => isOrder(a))
    .findLast((a) => a.sharePrice)?.sharePrice;

export const getCurrentValueOfOpenBatches = (
  portfolio: Portfolio,
  isin: string,
  currentPrice: number
): number => getPiecesOfIsinInPortfolio(portfolio, isin) * currentPrice;

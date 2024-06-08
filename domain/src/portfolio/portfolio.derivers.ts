import { sort, sum } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  getBatches,
  getBatchesAtTimeStamp,
  getBatchesOfType,
  getPositionDividendSum,
  getTotalTaxesForClosedBatches,
} from "../batch/batch.derivers";
import { BatchType, Batches } from "../batch/batch.entities";
import {
  sumDividendTaxes,
  sumDividends,
} from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { areOrdersEqualOnDay } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { Portfolio } from "./portfolio.entities";

const getOrdersForIsin = (portfolio: Portfolio, isin: string): Order[] =>
  portfolio.orders[isin] || [];

const getDividendPayoutsForIsin = (
  portfolio: Portfolio,
  isin: string
): DividendPayout[] => portfolio.dividendPayouts[isin] || [];

const getPortfolioBatchesOfType = <T extends BatchType>(
  portfolio: Portfolio,
  isin: string,
  batchType: T
): Batches[T] =>
  getBatchesOfType(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin),
    batchType
  );

export const getAllOrdersInPortfolio = (portfolio: Portfolio): Order[] =>
  Object.values(portfolio.orders).flat();

export const getAllDividendPayoutsInPortfolio = (
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

export const getAllOrdersInPortfolioTimeSorted = (
  portfolio: Portfolio
): Order[] => sort(getAllOrdersInPortfolio(portfolio), getNumericDateTime);

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType = "open"
): number => {
  return isin in portfolio.orders
    ? sum(
        getPortfolioBatchesOfType(portfolio, isin, batchType),
        (pos) => pos.pieces
      )
    : 0;
};

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

export const getInitialValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType = "open"
): number =>
  isin in portfolio.orders
    ? sum(
        getPortfolioBatchesOfType(portfolio, isin, batchType),
        (p) => p.buyPrice * p.pieces
      )
    : 0;

export const getEndValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number =>
  isin in portfolio.orders
    ? sum(
        getPortfolioBatchesOfType(portfolio, isin, "closed"),
        (p) => p.sellPrice * p.pieces
      )
    : 0;

export function getProfitForIsinInPortfolio(
  portfolio: Portfolio,
  isin: string
): number {
  return sum(
    getPortfolioBatchesOfType(portfolio, isin, "closed"),
    ({ pieces, buyPrice, sellPrice, orderFee, dividendPayouts, taxes }) =>
      pieces * (sellPrice - buyPrice) -
      orderFee -
      taxes +
      sumDividends(dividendPayouts) -
      sumDividendTaxes(dividendPayouts)
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
  const orders = getOrdersForIsin(portfolio, order.asset);
  const positionsAtOrderDate = getBatchesAtTimeStamp(
    orders,
    getNumericDateTime(order)
  );
  const piecesAvailable = sum(positionsAtOrderDate.open, (pos) => pos.pieces);
  return piecesAvailable + order.pieces >= 0;
};

export function getDividendSum(
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType
): number {
  return getPositionDividendSum(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin),
    batchType
  );
}

export function getTotalTaxesForClosedAssetBatches(
  portfolio: Portfolio,
  isin: string
): number {
  return getTotalTaxesForClosedBatches(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin)
  );
}

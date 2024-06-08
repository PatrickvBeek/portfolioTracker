import { sort, sum } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import { getBatches, getBatchesAtTimeStamp } from "../batch/batch.derivers";
import { Batches } from "../batch/batch.entities";
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
  positionType: keyof Batches = "open"
): number => {
  return isin in portfolio.orders
    ? sum(
        getBatches(portfolio, isin)?.[positionType] || [],
        (pos) => pos.pieces
      )
    : 0;
};

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Batches | "both"
): number => {
  const positions = getBatches(portfolio, isin);
  if (!positions) {
    return 0;
  }
  const fees = {
    ...positions,
    both: positions.open.concat(positions.closed),
  };

  return sum(fees[positionType], (pos) => pos.orderFee);
};

export const getInitialValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Batches = "open"
): number =>
  isin in portfolio.orders
    ? sum(
        getBatches(portfolio, isin)?.[positionType] || [],
        (p) => p.buyPrice * p.pieces
      )
    : 0;

export const getEndValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number =>
  isin in portfolio.orders
    ? sum(
        getBatches(portfolio, isin)?.closed || [],
        (p) => p.sellPrice * p.pieces
      )
    : 0;

export function getProfitForIsinInPortfolio(
  portfolio: Portfolio,
  isin: string
): number {
  return sum(
    getBatches(portfolio, isin)?.closed || [],
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

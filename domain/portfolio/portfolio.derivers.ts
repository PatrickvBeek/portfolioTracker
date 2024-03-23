import { sort, sum } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  sumDividendTaxes,
  sumDividends,
} from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { areOrdersEqualOnDay } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { getPositions } from "../position/position.derivers";
import { Positions } from "../position/position.entities";
import { Portfolio } from "./portfolio.entities";

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
  positionType: keyof Positions = "open"
): number => {
  return isin in portfolio.orders
    ? sum(
        getPositions(portfolio, isin)?.[positionType] || [],
        (pos) => pos.pieces
      )
    : 0;
};

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Positions | "both"
): number => {
  const positions = getPositions(portfolio, isin);
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
  positionType: keyof Positions = "open"
): number =>
  isin in portfolio.orders
    ? sum(
        getPositions(portfolio, isin)?.[positionType] || [],
        (p) => p.buyPrice * p.pieces
      )
    : 0;

export const getEndValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number =>
  isin in portfolio.orders
    ? sum(
        getPositions(portfolio, isin)?.closed || [],
        (p) => p.sellPrice * p.pieces
      )
    : 0;

export function getProfitForIsinInPortfolio(
  portfolio: Portfolio,
  isin: string
): number {
  return sum(
    getPositions(portfolio, isin)?.closed || [],
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
  return portfolio.orders[order.asset]?.some(
    (o) => areOrdersEqualOnDay(o, order) || false
  );
};

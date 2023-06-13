import { sort, sum } from "radash";
import { getNumericDateTime } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { getPositions } from "../position/position.derivers";
import { Positions } from "../position/position.entities";
import { Portfolio } from "./portfolio.entities";

export const getOrdersForIsinInPortfolio = (
  isin: string,
  portfolio: Portfolio
): Order[] => portfolio.orders[isin];

export const getAllIsinsInPortfolio = (portfolio: Portfolio): string[] =>
  Object.keys(portfolio.orders);

export const getAllOrdersInPortfolio = (portfolio: Portfolio): Order[] =>
  getAllIsinsInPortfolio(portfolio).flatMap((isin) =>
    getOrdersForIsinInPortfolio(isin, portfolio)
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
        getPositions(portfolio.orders[isin])?.[positionType] || [],
        (pos) => pos.pieces
      )
    : 0;
};

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Positions | "both"
): number => {
  const positions = getPositions(portfolio.orders[isin] || []);
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
        getPositions(portfolio.orders[isin])?.[positionType] || [],
        (p) => p.buyPrice * p.pieces
      )
    : 0;

export const getEndValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number =>
  isin in portfolio.orders
    ? sum(
        getPositions(portfolio.orders[isin])?.closed || [],
        (p) => p.sellPrice * p.pieces
      )
    : 0;

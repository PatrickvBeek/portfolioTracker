import { sortBy, sumBy } from "lodash";
import {
  Asset,
  AssetPositions,
  CashTransaction,
  Order,
  Portfolio,
  PortfolioLibrary,
} from "../types";
import { getPositions } from "./portfolioPositions";

export function addPortfolioToLibrary(
  previousLibrary: PortfolioLibrary,
  portfolio: Portfolio
): PortfolioLibrary {
  return {
    ...previousLibrary,
    [portfolio.name]: portfolio,
  };
}

export function deletePortfolioFromLibrary(
  previousLibrary: PortfolioLibrary,
  portfolio: Portfolio
): PortfolioLibrary {
  return previousLibrary
    ? Object.keys(previousLibrary)
        .filter((p) => portfolio.name !== p)
        .reduce(
          (lib, name) => Object.assign(lib, { [name]: previousLibrary[name] }),
          {}
        )
    : {};
}

export const getPiecesOfAssetInPortfolio = (
  portfolio: Portfolio,
  asset: Asset,
  positionType: keyof AssetPositions = "open"
): number => {
  return getPiecesOfIsinInPortfolio(portfolio, asset.isin, positionType);
};

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof AssetPositions = "open"
): number => {
  return isin in portfolio.orders
    ? sumBy(
        getPositions(portfolio.orders[isin])?.[positionType],
        (pos) => pos.pieces
      )
    : 0;
};

export const addOrderToPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => ({
  ...portfolio,
  orders: {
    ...portfolio.orders,
    [order.asset]: sortBy(
      [...(portfolio.orders[order.asset] || []), order],
      (order) => new Date(order.timestamp)
    ),
  },
});

export const deleteOrderFromPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => {
  if (!portfolio.orders[order.asset]) {
    return portfolio;
  }
  return {
    ...portfolio,
    orders: {
      ...portfolio.orders,
      [order.asset]: portfolio.orders[order.asset].filter(
        (currentOrder) => currentOrder.uuid !== order.uuid
      ),
    },
  };
};

export const addTransactionToPortfolio = (
  portfolio: Portfolio,
  transaction: CashTransaction
): Portfolio => ({
  ...portfolio,
  transactions: sortBy(
    [...portfolio.transactions, transaction],
    (transaction) => new Date(transaction.date)
  ),
});

export const deleteTransactionFromPortfolio = (
  portfolio: Portfolio,
  transaction: CashTransaction
): Portfolio => ({
  ...portfolio,
  transactions: portfolio.transactions.filter(
    (currentTransaction) => currentTransaction.uuid !== transaction.uuid
  ),
});

export const newPortfolioFromName: (name: string) => Portfolio = (name) => ({
  name: name,
  orders: {},
  transactions: [],
});

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof AssetPositions | "both"
): number => {
  const positions = getPositions(portfolio.orders[isin] || []);
  if (!positions) {
    return 0;
  }
  const fees = {
    ...positions,
    both: positions.open.concat(positions.closed),
  };

  return sumBy(fees[positionType], (pos) => pos.orderFee);
};

export const getInitialValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof AssetPositions = "open"
): number =>
  isin in portfolio.orders
    ? sumBy(
        getPositions(portfolio.orders[isin])?.[positionType],
        (p) => p.buyPrice * p.pieces
      )
    : 0;

export const getEndValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number =>
  isin in portfolio.orders
    ? sumBy(
        getPositions(portfolio.orders[isin])?.closed,
        (p) => p.sellPrice * p.pieces
      )
    : 0;

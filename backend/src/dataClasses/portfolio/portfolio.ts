import { ValueOf } from "type-fest";
import { isDeepStrictEqual } from "util";
import { Asset, Order } from "../general";

const CASH_TRANSACTION_KIND = {
  WITHDRAW: "WITHDRAW",
  DEPOSIT: "DEPOSIT",
};

export type CashTransactionKind = ValueOf<typeof CASH_TRANSACTION_KIND>;

export interface CashTransaction {
  uuid: string;
  date: string;
  amount: number;
  type: CashTransactionKind;
}

export interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
  transactions: CashTransaction[];
}

export const getPiecesOfAssetInPortfolio = (
  portfolio: Portfolio,
  asset: Asset
): number => {
  return getPiecesOfIsinInPortfolio(portfolio, asset.isin);
};

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number => {
  return isin in portfolio.orders
    ? portfolio.orders[isin].reduce(
        (pieces: number, order: Order) => pieces + order.pieces,
        0
      )
    : 0;
};

export const getValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number => {
  return isin in portfolio.orders
    ? portfolio.orders[isin].reduce(
        (value: number, order: Order) => value + order.amount,
        0
      )
    : 0;
};

export const addOrderToPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => {
  return {
    ...portfolio,
    orders: {
      ...portfolio.orders,
      [order.asset.isin]: [
        ...(portfolio.orders[order.asset.isin] || []),
        order,
      ],
    },
  };
};

export const deleteOrderFromPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => {
  if (!portfolio.orders[order.asset.isin]) {
    return portfolio;
  }
  return {
    ...portfolio,
    orders: {
      ...portfolio.orders,
      [order.asset.isin]: portfolio.orders[order.asset.isin].filter(
        (currentOrder) => currentOrder.uuid !== order.uuid
      ),
    },
  };
};

export const addTransactionToPortfolio = (
  portfolio: Portfolio,
  transaction: CashTransaction
): Portfolio => {
  return {
    ...portfolio,
    transactions: [...portfolio.transactions, transaction],
  };
};

export const deleteTransactionFromPortfolio = (
  portfolio: Portfolio,
  transaction: CashTransaction
): Portfolio => {
  return {
    ...portfolio,
    transactions: portfolio.transactions.filter(
      (currentTransaction) =>
        !isDeepStrictEqual(currentTransaction, transaction)
    ),
  };
};

import { partition, sortBy, sumBy } from "lodash";
import {
  Asset,
  AssetPositions,
  CashTransaction,
  Order,
  Portfolio,
  PortfolioLibrary,
  Position,
} from "../types";

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
  asset: Asset
): number => {
  return getPiecesOfIsinInPortfolio(portfolio, asset.isin);
};

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number => {
  return isin in portfolio.orders
    ? sumBy(getPositions(portfolio.orders[isin])?.open, (pos) => pos.pieces)
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
): Portfolio => {
  return {
    ...portfolio,
    transactions: portfolio.transactions.filter(
      (currentTransaction) => currentTransaction.uuid !== transaction.uuid
    ),
  };
};

export const newPortfolioFromName: (name: string) => Portfolio = (name) => ({
  name: name,
  orders: {},
  transactions: [],
});

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number => {
  return sumBy(
    Object.values(portfolio.orders[isin] || []),
    (order) => order.orderFee
  );
};

export const getInvestedValueOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string
): number => {
  return isin in portfolio.orders
    ? sumBy(getPositions(portfolio.orders[isin])?.open, (p) => p.bought)
    : 0;
};

export const getPositions = (orders: Order[]): AssetPositions | undefined => {
  function getPositionsFromSell(
    openPositions: Position[],
    sell: Order
  ): [Position[], Position[]] {
    const piecesToSell = -sell.pieces;
    const [firstPosition, ...remaining] = openPositions;

    if (piecesToSell === firstPosition.pieces) {
      return [remaining, [{ ...firstPosition, sold: sell.amount }]];
    }
    if (piecesToSell < firstPosition.pieces) {
      const newlyClosed = {
        ...firstPosition,
        pieces: piecesToSell,
        sold: sell.amount,
      };
      const reducedPosition = {
        ...firstPosition,
        pieces: firstPosition.pieces - piecesToSell,
      };
      return [[reducedPosition, ...remaining], [newlyClosed]];
    } else {
      const newlyClosed = { ...firstPosition, sold: sell.amount };
      const piecesStillToSell = piecesToSell - firstPosition.pieces;
      const [finallyOpen, alsoClosed] = getPositionsFromSell(remaining, {
        ...sell,
        pieces: -piecesStillToSell,
      });
      return [finallyOpen, [newlyClosed, ...alsoClosed]];
    }
  }

  if (sumBy(orders, (order) => order.pieces) < 0) {
    return undefined;
  }

  const [buyOrders, sellOrders] = partition(
    sortBy(orders, (order) => new Date(order.timestamp)),
    (order) => order.pieces > 0
  );
  const openPositions = buyOrders.map((buy) => ({
    pieces: buy.pieces,
    bought: buy.amount,
  }));

  return sellOrders.reduce(
    (positions, sell) => {
      const [stillOpen, closedFromSell] = getPositionsFromSell(
        positions.open,
        sell
      );
      return {
        open: stillOpen,
        closed: [...positions.closed, ...closedFromSell],
      };
    },
    { open: openPositions, closed: [] } as AssetPositions
  );
};

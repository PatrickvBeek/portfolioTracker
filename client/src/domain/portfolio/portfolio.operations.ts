import { sort } from "radash";
import { Order } from "../order/order.entities";
import { Portfolio, PortfolioLibrary } from "./portfolio.entities";

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

export const addOrderToPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => ({
  ...portfolio,
  orders: {
    ...portfolio.orders,
    [order.asset]: sort(
      [...(portfolio.orders[order.asset] || []), order],
      (order) => new Date(order.timestamp).getTime()
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

export const newPortfolioFromName: (name: string) => Portfolio = (name) => ({
  name: name,
  orders: {},
});

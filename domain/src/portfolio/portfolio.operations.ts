import { omit, shake, sort } from "radash";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
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
  portfolioName: string
): PortfolioLibrary {
  return previousLibrary ? omit(previousLibrary, [portfolioName]) : {};
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
    orders: purgeEmptyArrays({
      ...portfolio.orders,
      [order.asset]: portfolio.orders[order.asset].filter(
        (currentOrder) => currentOrder.uuid !== order.uuid
      ),
    }),
  };
};

export function addDividendPayoutToPortfolio(
  portfolio: Portfolio,
  payout: DividendPayout
) {
  return {
    ...portfolio,
    dividendPayouts: {
      ...portfolio.dividendPayouts,
      [payout.asset]: sort(
        [...(portfolio.dividendPayouts[payout.asset] || []), payout],
        (payout) => new Date(payout.timestamp).getTime()
      ),
    },
  };
}

export const deleteDividendPayoutFromPortfolio = (
  portfolio: Portfolio,
  payout: DividendPayout
): Portfolio => {
  if (!portfolio.dividendPayouts[payout.asset]) {
    return portfolio;
  }
  return {
    ...portfolio,
    dividendPayouts: purgeEmptyArrays({
      ...portfolio.dividendPayouts,
      [payout.asset]: portfolio.dividendPayouts[payout.asset].filter(
        (currentOrder) => currentOrder.uuid !== payout.uuid
      ),
    }),
  };
};

export const newPortfolioFromName: (name: string) => Portfolio = (name) => ({
  name: name,
  orders: {},
  dividendPayouts: {},
});

const purgeEmptyArrays = <T>(obj: Record<string, T[]>): Record<string, T[]> =>
  shake(obj, (value) => !value.length);

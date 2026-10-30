import { omit, shake, sort } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
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

const deleteActivityFrom = <T extends PortfolioActivity>(
  activities: Record<string, T[]>,
  activity: T
): Record<string, T[]> | undefined => {
  if (!activities[activity.asset]) {
    return undefined;
  }

  return purgeEmptyArrays({
    ...activities,
    [activity.asset]: activities[activity.asset].filter(
      (current) => current.uuid !== activity.uuid
    ),
  });
};

export const deleteOrderFromPortfolio = (
  portfolio: Portfolio,
  order: Order
): Portfolio => {
  const orders = deleteActivityFrom(portfolio.orders, order);
  return orders ? { ...portfolio, orders } : portfolio;
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
  const dividendPayouts = deleteActivityFrom(portfolio.dividendPayouts, payout);
  return dividendPayouts ? { ...portfolio, dividendPayouts } : portfolio;
};

export const newPortfolioFromName: (name: string) => Portfolio = (name) => ({
  name: name,
  orders: {},
  dividendPayouts: {},
});

const purgeEmptyArrays = <T>(obj: Record<string, T[]>): Record<string, T[]> =>
  shake(obj, (value) => !value.length);

const mergeActivityArrays = <T extends PortfolioActivity>(
  target: Record<string, T[]>,
  source: Record<string, T[]>
): Record<string, T[]> => {
  const merged = { ...target };
  for (const [asset, items] of Object.entries(source)) {
    merged[asset] = sort(
      [...(merged[asset] || []), ...items],
      getNumericDateTime
    );
  }
  return merged;
};

/**
 * Combines multiple portfolios into a single portfolio view.
 *
 * WARNING: The resulting portfolio is a synthetic aggregate - FIFO-based
 * calculations (e.g. getBatches, getRealizedGains, getBatchesHistory) will
 * produce incorrect results as they would match buys/sells across different
 * portfolios. Safe for aggregate metrics that don't rely on price differences
 * between buy and sell like total value, profit history, and cash flow calculations.
 */
export function combinePortfolios(portfolios: Portfolio[]): Portfolio {
  return portfolios.reduce(
    (combined, portfolio) => ({
      ...combined,
      orders: mergeActivityArrays(combined.orders, portfolio.orders),
      dividendPayouts: mergeActivityArrays(
        combined.dividendPayouts,
        portfolio.dividendPayouts
      ),
    }),
    {
      name: "",
      orders: {},
      dividendPayouts: {},
    }
  );
}

import { uid } from "radash";
import { v4 } from "uuid";
import { DividendPayout } from "./dividendPayouts/dividend.entities";
import { Order } from "./order/order.entities";
import { Portfolio } from "./portfolio/portfolio.entities";
import { TEST_PORTFOLIO } from "./testConstants";

export function getTestPortfolio(overrides: Partial<Portfolio>): Portfolio {
  return {
    ...TEST_PORTFOLIO,
    ...overrides,
  };
}

export function getTestOrder(order: Partial<Order>): Order {
  return {
    asset: uid(6),
    orderFee: Math.random() * 100,
    pieces: Math.random() * 100,
    sharePrice: Math.random() * 1000,
    timestamp: new Date().toISOString(),
    taxes: Math.random() * 100,
    uuid: v4(),
    ...order,
  };
}

export const getTestDividendPayout = (
  payout: Partial<DividendPayout>,
): DividendPayout => ({
  asset: uid(6),
  dividendPerShare: Math.random() * 100,
  pieces: Math.random() * 100,
  taxes: Math.random() * 10,
  timestamp: new Date().toISOString(),
  uuid: v4(),
  ...payout,
});

export function getTestOrdersGroupedByAsset(
  orderProps: Partial<Order>[],
): Record<string, Order[]> {
  return getElementsGroupedByAsset(orderProps.map(getTestOrder));
}

export function getTestDividendPayoutsGroupedByAsset(
  payouts: Partial<DividendPayout>[],
): Record<string, DividendPayout[]> {
  return getElementsGroupedByAsset(payouts.map(getTestDividendPayout));
}

export function getElementsGroupedByAsset<T extends { asset: string }>(
  elements: T[],
): Record<string, T[]> {
  return getElementsGroupedBy(
    elements,
    (order: { asset: string }) => order.asset,
  );
}

export function getElementsByIsin<T extends { isin: string }>(
  elements: T[],
): Record<string, T> {
  return getElementsBy(elements, (order: { isin: string }) => order.isin);
}

function getElementsGroupedBy<T>(
  elements: T[],
  predicate: (el: T) => string,
): Record<string, T[]> {
  return elements.reduce(
    (map, element) => {
      const key = predicate(element);
      const group = map[key] || [];
      return Object.assign(map, {
        [key]: [...group, element],
      });
    },
    {} as Record<string, T[]>,
  );
}

function getElementsBy<T>(
  elements: T[],
  predicate: (el: T) => string,
): Record<string, T> {
  return elements.reduce(
    (map, element) => Object.assign(map, { [predicate(element)]: element }),
    {} as Record<string, T>,
  );
}

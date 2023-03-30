import { list } from "radash";
import { v4 } from "uuid";
import { getRandomString } from "../utils";
import { Order, Portfolio } from "./types";

export function getTestOrder(order: Partial<Order>): Order {
  return {
    asset: getRandomString(6),
    orderFee: Math.random() * 100,
    pieces: Math.random() * 100,
    sharePrice: Math.random() * 1000,
    timestamp: new Date().toISOString(),
    uuid: v4(),
    ...order,
  };
}

function getTestPortfolio(portfolio: Partial<Portfolio>): Portfolio {
  const numberOfRandomOrders = Math.floor(Math.random() * 10);
  const orders = list(numberOfRandomOrders).map(() => getTestOrder({}));
  return {
    name: getRandomString(6),
    orders: getElementsGroupedByAsset(orders),
    transactions: [],
  };
}

export function getElementsGroupedByAsset<T extends { asset: string }>(
  elements: T[]
): Record<string, T[]> {
  return getElementsGroupedBy(
    elements,
    (order: { asset: string }) => order.asset
  );
}

export function getElementsByIsin<T extends { isin: string }>(
  elements: T[]
): Record<string, T> {
  return getElementsBy(elements, (order: { isin: string }) => order.isin);
}

function getElementsGroupedBy<T>(
  elements: T[],
  predicate: (el: T) => string
): Record<string, T[]> {
  return elements.reduce((map, element) => {
    const key = predicate(element);
    const group = map[key] || [];
    return Object.assign(map, {
      [key]: [...group, element],
    });
  }, {} as Record<string, T[]>);
}

function getElementsBy<T>(
  elements: T[],
  predicate: (el: T) => string
): Record<string, T> {
  return elements.reduce(
    (map, element) => Object.assign(map, { [predicate(element)]: element }),
    {} as Record<string, T>
  );
}

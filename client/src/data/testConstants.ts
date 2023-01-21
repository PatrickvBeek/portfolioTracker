import { randomUUID } from "crypto";
import { CashTransaction, Order, Portfolio } from "./types";

export const TEST_ASSET_TESLA = {
  displayName: "tesla",
  isin: "isin-tesla",
};
export const TEST_ASSET_GOOGLE = {
  displayName: "google",
  isin: "isin-google",
};

export const TEST_ASSET_LIB = {
  [TEST_ASSET_GOOGLE.isin]: TEST_ASSET_GOOGLE,
  [TEST_ASSET_TESLA.isin]: TEST_ASSET_TESLA,
};

export const TEST_ORDER_TESLA = {
  uuid: randomUUID(),
  asset: TEST_ASSET_TESLA.isin,
  amount: 100,
  orderFee: 1,
  pieces: 2.4,
  timestamp: "2022-04-02",
};

export const TEST_ORDER_1_GOOGLE = {
  uuid: randomUUID(),
  asset: TEST_ASSET_GOOGLE.isin,
  amount: 100,
  orderFee: 1,
  pieces: 1.1,
  timestamp: "2022-04-02",
};

export const TEST_ORDER_2_GOOGLE = {
  uuid: randomUUID(),
  asset: TEST_ASSET_GOOGLE.isin,
  amount: -105,
  orderFee: 1,
  pieces: -1,
  timestamp: "2022-04-02",
};

export const TEST_TRANSACTION: CashTransaction = {
  uuid: randomUUID(),
  date: "2022-05-08",
  amount: 100,
  type: "deposit",
};

export const TEST_PORTFOLIO: Portfolio = {
  name: "Test Portfolio",
  orders: {
    [TEST_ASSET_GOOGLE.isin]: [TEST_ORDER_1_GOOGLE, TEST_ORDER_2_GOOGLE],
    [TEST_ASSET_TESLA.isin]: [TEST_ORDER_TESLA],
  },
  transactions: [TEST_TRANSACTION],
};

export function getTestOrder(overrides: Partial<Order>): Order {
  return { ...TEST_ORDER_TESLA, ...overrides };
}

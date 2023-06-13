import { randomUUID } from "crypto";
import { Portfolio } from "./portfolio/portfolio.entities";

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
  sharePrice: 100,
  orderFee: 1,
  pieces: 2.4,
  timestamp: "2022-04-02",
};

export const TEST_ORDER_1_GOOGLE = {
  uuid: randomUUID(),
  asset: TEST_ASSET_GOOGLE.isin,
  sharePrice: 100,
  orderFee: 1,
  pieces: 2,
  timestamp: "2022-04-02",
};

export const TEST_ORDER_2_GOOGLE = {
  uuid: randomUUID(),
  asset: TEST_ASSET_GOOGLE.isin,
  sharePrice: 105,
  orderFee: 1,
  pieces: -1,
  timestamp: "2022-04-02",
};

export const TEST_PORTFOLIO: Portfolio = {
  name: "Test Portfolio",
  orders: {
    [TEST_ASSET_GOOGLE.isin]: [TEST_ORDER_1_GOOGLE, TEST_ORDER_2_GOOGLE],
    [TEST_ASSET_TESLA.isin]: [TEST_ORDER_TESLA],
  },
};

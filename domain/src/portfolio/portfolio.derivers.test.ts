import { it } from "vitest";
import {
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestOrder,
  getTestPortfolio,
} from "../dataHelpers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import {
  TEST_ASSET_GOOGLE,
  TEST_ASSET_TESLA,
  TEST_ORDER_1_GOOGLE,
  TEST_ORDER_2_GOOGLE,
  TEST_ORDER_TESLA,
} from "../testConstants";
import {
  getAllOrdersInPortfolio,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getProfitForIsin,
  isOrderValidForPortfolio,
} from "./portfolio.derivers";
import { Portfolio } from "./portfolio.entities";

const TEST_PORTFOLIO: Portfolio = {
  name: "test-portfolio",
  orders: {
    [TEST_ASSET_TESLA.isin]: [TEST_ORDER_TESLA],
    [TEST_ASSET_GOOGLE.isin]: [TEST_ORDER_1_GOOGLE, TEST_ORDER_2_GOOGLE],
  },
  dividendPayouts: {},
};

const createTestPortfolio = (
  orders: Partial<Order>[],
  payouts: Partial<DividendPayout>[],
): Portfolio =>
  getTestPortfolio({
    orders: getElementsGroupedByAsset(orders.map(getTestOrder)),
    dividendPayouts: getElementsGroupedByAsset(
      payouts.map(getTestDividendPayout),
    ),
  });

describe("The Portfolio deriver", () => {
  describe("getAllOrdersInPortfolio", () => {
    it("returns the correct orders", () => {
      expect(getAllOrdersInPortfolio(TEST_PORTFOLIO)).toEqual([
        TEST_ORDER_TESLA,
        TEST_ORDER_1_GOOGLE,
        TEST_ORDER_2_GOOGLE,
      ]);
    });
  });

  describe("getOrderFeesOfIsinInPortfolio", () => {
    describe("calculates the order fees correctly", () => {
      const testPortfolio = TEST_PORTFOLIO;
      const isins = Object.keys(testPortfolio.orders);

      it("for open", () => {
        expect(
          isins.map((isin) =>
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "open"),
          ),
        ).toEqual([1, 0.5]);
      });

      it("for closed", () => {
        expect(
          isins.map((isin) =>
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "closed"),
          ),
        ).toEqual([0, 1.5]);
      });

      it("for both", () => {
        expect(
          isins.map((isin) =>
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "both"),
          ),
        ).toEqual([1, 2]);
      });
    });

    it("returns 0 if there are no orders for this isin", () => {
      const testPortfolio: Portfolio = {
        dividendPayouts: {},
        orders: {},
        name: "test",
      };

      expect(
        getOrderFeesOfIsinInPortfolio(testPortfolio, "not there", "open"),
      ).toBe(0);
    });
  });

  describe("getInvestedValueOfIsinInPortfolio returns the correct value for", () => {
    const testPortfolio = TEST_PORTFOLIO;

    it("a single open position", () => {
      expect(
        getInitialValueOfIsinInPortfolio(testPortfolio, TEST_ASSET_GOOGLE.isin),
      ).toEqual(100);
    });

    it("a single closed position", () => {
      expect(
        getInitialValueOfIsinInPortfolio(
          testPortfolio,
          TEST_ASSET_GOOGLE.isin,
          "closed",
        ),
      ).toEqual(100);
    });

    it("for an non existing isin", () => {
      expect(
        getInitialValueOfIsinInPortfolio(
          testPortfolio,
          "not present",
          "closed",
        ),
      ).toEqual(0);
    });
  });

  describe("isOrderValidForPortfolio", () => {
    const earlyDate = new Date("2024-06-01").toISOString();
    const middleDate = new Date("2024-06-02").toISOString();
    const laterDate = new Date("2024-06-03").toISOString();
    describe("for a buy order", () => {
      it("returns true if teh portfolio is empty", () => {
        expect(
          isOrderValidForPortfolio(
            getTestPortfolio({}),
            getTestOrder({ pieces: 5 }),
          ),
        ).toBe(true);
      });

      it("returns true for existing orders when adding a new order before the first existing one", () => {
        const portfolio = getTestPortfolio({
          orders: getElementsGroupedByAsset([
            getTestOrder({ timestamp: laterDate, pieces: 6 }),
          ]),
        });

        expect(
          isOrderValidForPortfolio(
            portfolio,
            getTestOrder({ timestamp: earlyDate, pieces: 1 }),
          ),
        ).toBe(true);
      });

      it("returns true for adding a new order later", () => {
        const portfolio = getTestPortfolio({
          orders: getElementsGroupedByAsset([
            getTestOrder({ timestamp: earlyDate, pieces: 6 }),
          ]),
        });

        expect(
          isOrderValidForPortfolio(
            portfolio,
            getTestOrder({ timestamp: laterDate, pieces: 1 }),
          ),
        ).toBe(true);
      });
    });

    describe("for a sell order", () => {
      it("returns false when no positions of this asset are available", () => {
        const portfolio = getTestPortfolio({
          orders: getElementsGroupedByAsset([
            getTestOrder({
              asset: "unrelated-asset",
              pieces: 5,
              timestamp: earlyDate,
            }),
          ]),
        });
        expect(
          isOrderValidForPortfolio(
            portfolio,
            getTestOrder({
              asset: "test-asset",
              pieces: -2,
              timestamp: laterDate,
            }),
          ),
        ).toBe(false);
      });

      it("returns false when trying to sell more than is available", () => {
        const portfolio = getTestPortfolio({
          orders: getElementsGroupedByAsset([
            getTestOrder({
              asset: "test-asset",
              pieces: 3,
              timestamp: earlyDate,
            }),
            getTestOrder({
              asset: "test-asset",
              pieces: 50,
              timestamp: laterDate,
            }),
          ]),
        });

        expect(
          isOrderValidForPortfolio(
            portfolio,
            getTestOrder({
              asset: "test-asset",
              timestamp: middleDate,
              pieces: -10,
            }),
          ),
        ).toBe(false);
      });

      it("returns true when enough pieces are available", () => {
        const portfolio = getTestPortfolio({
          orders: getElementsGroupedByAsset([
            getTestOrder({
              asset: "test-asset",
              pieces: 3,
              timestamp: earlyDate,
            }),
            getTestOrder({
              asset: "test-asset",
              pieces: 50,
              timestamp: middleDate,
            }),
          ]),
        });

        expect(
          isOrderValidForPortfolio(
            portfolio,
            getTestOrder({
              asset: "test-asset",
              timestamp: middleDate,
              pieces: -10,
            }),
          ),
        ).toBe(true);
      });
    });
  });

  describe("getProfitForIsin", () => {
    const day1 = "2024-06-01";
    const day2 = "2024-06-02";
    const day3 = "2024-06-03";
    const day4 = "2024-06-04";
    const day5 = "2024-06-05";
    it("for a complex scenario", () => {
      const portfolio = createTestPortfolio(
        [
          {
            asset: "asset",
            sharePrice: 10,
            pieces: 10,
            orderFee: 2,
            taxes: 0,
            timestamp: day1,
          },
          {
            asset: "asset",
            sharePrice: 12,
            pieces: 10,
            orderFee: 4,
            taxes: 0,
            timestamp: day2,
          },
          {
            asset: "asset",
            sharePrice: 15,
            pieces: -15,
            orderFee: 2,
            taxes: 3,
            timestamp: day4,
          },
          {
            asset: "asset",
            sharePrice: 17,
            pieces: -5,
            orderFee: 0,
            taxes: 0.5,
            timestamp: day5,
          },
        ],
        [
          {
            pieces: 20,
            dividendPerShare: 0.25,
            taxes: 1.5,
            asset: "asset",
            timestamp: day3,
          },
        ],
      );

      expect(getProfitForIsin(portfolio, "asset")).toEqual(82);
    });
  });
});

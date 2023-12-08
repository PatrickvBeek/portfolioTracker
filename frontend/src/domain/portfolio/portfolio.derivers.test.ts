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
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "open")
          )
        ).toEqual([1, 0.5]);
      });

      it("for closed", () => {
        expect(
          isins.map((isin) =>
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "closed")
          )
        ).toEqual([0, 1.5]);
      });

      it("for both", () => {
        expect(
          isins.map((isin) =>
            getOrderFeesOfIsinInPortfolio(testPortfolio, isin, "both")
          )
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
        getOrderFeesOfIsinInPortfolio(testPortfolio, "not there", "open")
      ).toBe(0);
    });
  });

  describe("getInvestedValueOfIsinInPortfolio returns the correct value for", () => {
    const testPortfolio = TEST_PORTFOLIO;

    it("a single open position", () => {
      expect(
        getInitialValueOfIsinInPortfolio(testPortfolio, TEST_ASSET_GOOGLE.isin)
      ).toEqual(100);
    });

    it("a single closed position", () => {
      expect(
        getInitialValueOfIsinInPortfolio(
          testPortfolio,
          TEST_ASSET_GOOGLE.isin,
          "closed"
        )
      ).toEqual(100);
    });

    it("for an non existing isin", () => {
      expect(
        getInitialValueOfIsinInPortfolio(testPortfolio, "not present", "closed")
      ).toEqual(0);
    });
  });
});

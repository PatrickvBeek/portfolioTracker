import {
  TEST_ASSET_GOOGLE,
  TEST_ORDER_1_GOOGLE,
  TEST_PORTFOLIO,
} from "../testConstants";
import { Portfolio } from "./portfolio.entities";
import {
  addOrderToPortfolio,
  deleteOrderFromPortfolio,
} from "./portfolio.operations";

describe("The portfolio deriver", () => {
  describe("addOrderToPortfolio", () => {
    it("can add order to a portfolio without existing orders of same isin", () => {
      const testPortfolio: Portfolio = { ...TEST_PORTFOLIO, orders: {} };
      const newPortfolio = addOrderToPortfolio(
        testPortfolio,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio.orders[TEST_ORDER_1_GOOGLE.asset]).toEqual([
        TEST_ORDER_1_GOOGLE,
      ]);
    });

    it("can add a single order to a portfolio with existing order of same isin", () => {
      const newPortfolio = addOrderToPortfolio(
        TEST_PORTFOLIO,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio.orders[TEST_ORDER_1_GOOGLE.asset]).toEqual([
        ...TEST_PORTFOLIO.orders[TEST_ORDER_1_GOOGLE.asset],
        TEST_ORDER_1_GOOGLE,
      ]);
    });
  });

  describe("deleteOrderFromPortfolio", () => {
    it("returns the original portfolio, if the order to delete is not contained", () => {
      const testPortfolio: Portfolio = { ...TEST_PORTFOLIO, orders: {} };
      const newPortfolio = deleteOrderFromPortfolio(
        testPortfolio,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio).toEqual(testPortfolio);
    });
    it("returns a portfolio with the correct order deleted", () => {
      const newPortfolio = deleteOrderFromPortfolio(
        TEST_PORTFOLIO,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio.orders[TEST_ASSET_GOOGLE.isin]).toHaveLength(
        TEST_PORTFOLIO.orders[TEST_ASSET_GOOGLE.isin].length - 1
      );
    });
  });
});

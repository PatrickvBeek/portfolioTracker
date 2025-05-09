import {
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestOrder,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "../dataHelpers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import { TEST_ORDER_1_GOOGLE, TEST_PORTFOLIO } from "../testConstants";
import { Portfolio } from "./portfolio.entities";
import {
  addOrderToPortfolio,
  combinePortfolios,
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

  describe("combinePortfolios", () => {
    const getOrder = (date: string): Order =>
      getTestOrder({
        timestamp: date,
        asset: "asset-1",
        pieces: 10,
        sharePrice: 150,
        orderFee: 5,
      });

    const getDividend = (date: string): DividendPayout =>
      getTestDividendPayout({
        timestamp: date,
        asset: "asset-1",
        dividendPerShare: 1,
        pieces: 10,
      });

    it("combines two empty portfolios", () => {
      const portfolio1 = getTestPortfolio({ orders: {}, dividendPayouts: {} });
      const portfolio2 = getTestPortfolio({ orders: {}, dividendPayouts: {} });

      const result = combinePortfolios([portfolio1, portfolio2]);

      expect(result.name).toBe(`${portfolio1.name}::${portfolio2.name}`);
      expect(Object.values(result.orders).flat()).toEqual([]);
      expect(Object.values(result.dividendPayouts).flat()).toEqual([]);
    });

    it("combines one empty and one non-empty portfolio", () => {
      const order = getOrder("2023-01-01");
      const dividend = getDividend("2023-02-01");
      const portfolio1 = getTestPortfolio({
        orders: { [order.asset]: [order] },
        dividendPayouts: { [dividend.asset]: [dividend] },
      });
      const portfolio2 = getTestPortfolio({ orders: {}, dividendPayouts: {} });

      const combinedPortfolio = combinePortfolios([portfolio1, portfolio2]);

      expect(combinedPortfolio.orders).toEqual(
        getElementsGroupedByAsset([order])
      );
      expect(combinedPortfolio.dividendPayouts).toEqual(
        getElementsGroupedByAsset([dividend])
      );
    });

    it("combines two portfolios with orders and dividends", () => {
      const order1 = getOrder("2023-01-01");
      const dividend1 = getDividend("2023-02-01");
      const portfolio1 = getTestPortfolio({
        orders: getElementsGroupedByAsset([order1]),
        dividendPayouts: getElementsGroupedByAsset([dividend1]),
      });

      const order2 = getOrder("2023-01-02");
      const dividend2 = getDividend("2023-02-02");
      const portfolio2 = getTestPortfolio({
        orders: getElementsGroupedByAsset([order2]),
        dividendPayouts: getElementsGroupedByAsset([dividend2]),
      });

      const combinedPortfolio = combinePortfolios([portfolio1, portfolio2]);

      expect(combinedPortfolio.orders).toEqual(
        getElementsGroupedByAsset([order1, order2])
      );
      expect(combinedPortfolio.dividendPayouts).toEqual(
        getElementsGroupedByAsset([dividend1, dividend2])
      );
    });

    it("sorts transactions chronologically", () => {
      const order2 = getOrder("2023-01-02");
      const dividend2 = getDividend("2023-02-02");
      const portfolio1 = getTestPortfolio({
        orders: getElementsGroupedByAsset([order2]),
        dividendPayouts: getElementsGroupedByAsset([dividend2]),
      });

      const order1 = getOrder("2023-01-01");
      const dividend1 = getDividend("2023-02-01");
      const portfolio2 = getTestPortfolio({
        orders: getElementsGroupedByAsset([order1]),
        dividendPayouts: getElementsGroupedByAsset([dividend1]),
      });

      const combinedPortfolio = combinePortfolios([portfolio1, portfolio2]);
      const { orders, dividendPayouts } = combinedPortfolio;

      expect(orders).toEqual({ [order1.asset]: [order1, order2] });
      expect(dividendPayouts).toEqual({
        [dividend1.asset]: [dividend1, dividend2],
      });
    });
  });

  describe("deleteOrderFromPortfolio", () => {
    it("returns the original portfolio, if the order to delete is not contained", () => {
      const testOrder = getTestOrder({ asset: "some-asset" });
      const testPortfolio = getTestPortfolio({ orders: {} });
      const newPortfolio = deleteOrderFromPortfolio(testPortfolio, testOrder);
      expect(newPortfolio).toEqual(testPortfolio);
    });

    it("returns a portfolio with the correct order deleted", () => {
      const order1 = getTestOrder({ asset: "a1" });
      const order2 = getTestOrder({ asset: "a1" });
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([order1, order2]),
      });

      const newPortfolio = deleteOrderFromPortfolio(portfolio, order1);

      expect(newPortfolio.orders[order1.asset]).toHaveLength(
        portfolio.orders[order1.asset].length - 1
      );
    });

    it("removes empty arrays after deleting the order", () => {
      const order1 = getTestOrder({ asset: "a1" });
      const order2 = getTestOrder({ asset: "a2" });
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([order1, order2]),
      });

      const newPortfolio = deleteOrderFromPortfolio(portfolio, order1);

      expect(newPortfolio.orders).toEqual(getElementsGroupedByAsset([order2]));
    });
  });
});

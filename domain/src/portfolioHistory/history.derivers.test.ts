import {
  getTestDividendPayoutsGroupedByAsset,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "../dataHelpers";
import { getCashFlowHistory } from "../portfolio/portfolio.derivers";
import { Portfolio } from "../portfolio/portfolio.entities";
import { geBuyValueHistoryForPortfolio } from "./history.derivers";

const DAY1 = "2023-01-01";
const DAY2 = "2023-01-02";
const DAY3 = "2023-01-03";

describe("the history operation", () => {
  describe("getBuyValueHistory", () => {
    it("returns the correct history for a portfolio having orders. Selling orders in order of buying", () => {
      const TEST_PORTFOLIO: Portfolio = {
        name: "test-portfolio",
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "asset1",
            timestamp: DAY1,
            sharePrice: 10,
            pieces: 2,
            orderFee: 15, // not relevant
          },
          {
            asset: "asset2",
            timestamp: DAY2,
            pieces: 1,
            sharePrice: 5,
          },
          {
            asset: "asset1",
            timestamp: DAY3,
            pieces: -1,
            sharePrice: 11,
          },
        ]),
        dividendPayouts: {},
      };

      expect(geBuyValueHistoryForPortfolio(TEST_PORTFOLIO)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 20 },
          { timestamp: DAY2, value: 25 },
          { timestamp: DAY3, value: 15 },
        ])
      );
    });

    it("returns the correct history for a portfolio having orders. Selling orders out of order of buying", () => {
      const TEST_PORTFOLIO: Portfolio = {
        name: "test-portfolio",
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "asset1",
            timestamp: DAY1,
            sharePrice: 10,
            pieces: 2,
          },
          {
            asset: "asset2",
            timestamp: DAY2,
            pieces: 1,
            sharePrice: 5,
          },
          {
            asset: "asset2",
            timestamp: DAY3,
            pieces: -1,
            sharePrice: 6,
          },
        ]),
        dividendPayouts: {},
      };

      expect(geBuyValueHistoryForPortfolio(TEST_PORTFOLIO)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 20 },
          { timestamp: DAY2, value: 25 },
          { timestamp: DAY3, value: 20 },
        ])
      );
    });
  });

  describe("getCashFlowHistory", () => {
    it("buying and selling without costs", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 11,
            pieces: 2,
            timestamp: DAY1,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a2",
            sharePrice: 25,
            pieces: 1,
            timestamp: DAY2,
            orderFee: 0,
            taxes: 0,
          },
        ]),
      });

      expect(getCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 80 },
          { timestamp: DAY1, value: 102 },
          { timestamp: DAY2, value: 90 },
          { timestamp: DAY2, value: 115 },
        ])
      );
    });

    it("buying and selling with costs", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 5,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 5,
            taxes: 0.5,
          },
          {
            asset: "a2",
            sharePrice: 25,
            pieces: 1,
            timestamp: DAY2,
            orderFee: 10,
            taxes: 0.25,
          },
        ]),
      });

      expect(getCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 85 },
          { timestamp: DAY2, value: 78.5 },
          { timestamp: DAY2, value: 113.75 },
        ])
      );
    });

    it("with orders and dividends", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 5,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 5,
            taxes: 0.5,
          },
        ]),
        dividendPayouts: getTestDividendPayoutsGroupedByAsset([
          {
            asset: "a1",
            dividendPerShare: 3,
            pieces: 8,
            taxes: 4,
            timestamp: DAY3,
          },
        ]),
      });

      expect(getCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 85 },
          { timestamp: DAY2, value: 78.5 },
          { timestamp: DAY3, value: 58.5 },
        ])
      );
    });
  });
});

const getValuesAsHistory = (values: { timestamp: string; value: number }[]) =>
  values.map(({ timestamp, value }) => ({
    timestamp: new Date(timestamp).getTime(),
    value,
  }));

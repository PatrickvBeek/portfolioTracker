import {
  TEST_ASSET_GOOGLE,
  TEST_ASSET_TESLA,
  TEST_ORDER_1_GOOGLE,
  TEST_ORDER_2_GOOGLE,
  TEST_ORDER_TESLA,
  TEST_TRANSACTION,
} from "../testUtils";
import {
  addOrderToPortfolio,
  addTransactionToPortfolio,
  deleteOrderFromPortfolio,
  deleteTransactionFromPortfolio,
  getPiecesOfAssetInPortfolio,
  Portfolio,
} from "./portfolio";

const TEST_PORTFOLIO: Portfolio = {
  name: "test-portfolio",
  orders: {
    [TEST_ASSET_TESLA.isin]: [TEST_ORDER_TESLA],
    [TEST_ASSET_GOOGLE.isin]: [TEST_ORDER_1_GOOGLE, TEST_ORDER_2_GOOGLE],
  },
  transactions: [TEST_TRANSACTION],
};

describe("The Portfolio utility function", () => {
  describe("getPiecesOfAssetInPortfolio", () => {
    it("returns 0 if asset not in Portfolio", () => {
      expect(
        getPiecesOfAssetInPortfolio(TEST_PORTFOLIO, {
          displayName: "invalid",
          isin: "isin",
        })
      ).toEqual(0);
    });

    it("returns the correct pieces if only one transaction for this asset is in portfolio", () => {
      expect(
        getPiecesOfAssetInPortfolio(TEST_PORTFOLIO, TEST_ASSET_TESLA)
      ).toEqual(TEST_ORDER_TESLA.pieces);
    });

    it("returns the correct pieces if multiple transactions for this asset are in portfolio", () => {
      expect(
        getPiecesOfAssetInPortfolio(TEST_PORTFOLIO, TEST_ASSET_GOOGLE)
      ).toEqual(TEST_ORDER_1_GOOGLE.pieces + TEST_ORDER_2_GOOGLE.pieces);
    });
  });

  describe("addOrderToPortfolio", () => {
    it("can add order to a portfolio without existing orders of same isin", () => {
      const testPortfolio: Portfolio = { ...TEST_PORTFOLIO, orders: {} };
      const newPortfolio = addOrderToPortfolio(
        testPortfolio,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio.orders[TEST_ORDER_1_GOOGLE.asset.isin]).toEqual([
        TEST_ORDER_1_GOOGLE,
      ]);
    });

    it("can add a single order to a portfolio with existing order of same isin", () => {
      const newPortfolio = addOrderToPortfolio(
        TEST_PORTFOLIO,
        TEST_ORDER_1_GOOGLE
      );
      expect(newPortfolio.orders[TEST_ORDER_1_GOOGLE.asset.isin]).toEqual([
        ...TEST_PORTFOLIO.orders[TEST_ORDER_1_GOOGLE.asset.isin],
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

  describe("addTransactionToPortfolio", () => {
    it("can add a transaction to an existing portfolio with empty transactions array", () => {
      const testPortfolio = { ...TEST_PORTFOLIO, transactions: [] };
      const newPortfolio = addTransactionToPortfolio(
        testPortfolio,
        TEST_TRANSACTION
      );
      expect(newPortfolio.transactions).toEqual([TEST_TRANSACTION]);
    });

    it("can add a transaction to an existing portfolio with existing transactions", () => {
      const newPortfolio = addTransactionToPortfolio(
        TEST_PORTFOLIO,
        TEST_TRANSACTION
      );
      expect(newPortfolio.transactions).toEqual([
        TEST_TRANSACTION,
        TEST_TRANSACTION,
      ]);
    });
  });

  describe("deleteTransactionFromPortfolio", () => {
    it("can delete an existing transaction from a portfolio", () => {
      expect(
        deleteTransactionFromPortfolio(TEST_PORTFOLIO, TEST_TRANSACTION)
          .transactions
      ).toEqual([]);
    });

    it("returns the original portfolio if no transactions are contained yet in the portfolio", () => {
      const testPortfolio = { ...TEST_PORTFOLIO, transactions: [] };
      expect(
        deleteTransactionFromPortfolio(testPortfolio, TEST_TRANSACTION)
      ).toEqual(testPortfolio);
    });
  });
});

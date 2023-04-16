import {
  TEST_ORDER_1_GOOGLE,
  TEST_PORTFOLIO,
  TEST_TRANSACTION,
} from "../../dataClasses/testUtils";
import { PortfolioLibrary } from "./portfolioLibrary";

const TEST_PATH = "./test_data/portfolio.entities";
const TEST_FILE = "PortfolioLibrary";

describe("the portfolio library", () => {
  const lib = new PortfolioLibrary(TEST_PATH, TEST_FILE);
  beforeEach(() => {
    lib.clear();
  });
  it("can be instantiated", () => {
    expect(lib).toBeDefined();
  });

  it("can create a new Portfolio", () => {
    lib.createPortfolio("bank1");
    expect(lib.portfolios["bank1"].name).toEqual("bank1");
  });

  it("can delete a portfolio", () => {
    const portfolioName = "another_portfolio";
    lib.portfolios = {
      [TEST_PORTFOLIO.name]: TEST_PORTFOLIO,
      [portfolioName]: TEST_PORTFOLIO,
    };
    lib.deletePortfolio(portfolioName);
    expect(lib.portfolios).toEqual({ [TEST_PORTFOLIO.name]: TEST_PORTFOLIO });
  });

  it("can add an order to an existing portfolio", () => {
    lib.createPortfolio("gambling");
    lib.addOrder({ portfolio: "gambling", order: TEST_ORDER_1_GOOGLE });
    expect(
      lib.portfolios["gambling"].orders[TEST_ORDER_1_GOOGLE.asset.isin]
    ).toEqual([TEST_ORDER_1_GOOGLE]);
  });

  it("can delete an existing order in a portfolio", () => {
    lib.createPortfolio("gambling");
    lib.addOrder({ portfolio: "gambling", order: TEST_ORDER_1_GOOGLE });
    expect(
      lib.portfolios["gambling"].orders[TEST_ORDER_1_GOOGLE.asset.isin]
    ).toEqual([TEST_ORDER_1_GOOGLE]);

    lib.deleteOrder({ portfolio: "gambling", order: TEST_ORDER_1_GOOGLE });
    expect(
      lib.portfolios["gambling"].orders[TEST_ORDER_1_GOOGLE.asset.isin]
    ).toEqual([]);
  });

  it("can add a transaction to a portfolio", () => {
    lib.createPortfolio("test-portfolio");
    lib.addTransaction({
      portfolio: "test-portfolio",
      transaction: TEST_TRANSACTION,
    });
    expect(lib.portfolios["test-portfolio"].transactions).toEqual([
      TEST_TRANSACTION,
    ]);
  });

  it("can delete a transaction from a portfolio", () => {
    lib.createPortfolio("portfolio");
    lib.addTransaction({
      portfolio: "portfolio",
      transaction: TEST_TRANSACTION,
    });
    expect(lib.portfolios["portfolio"].transactions).toEqual([
      TEST_TRANSACTION,
    ]);

    lib.deleteTransaction({
      portfolio: "portfolio",
      transaction: TEST_TRANSACTION,
    });
    expect(lib.portfolios["portfolio"].transactions).toEqual([]);
  });
});

import { it, vi } from "vitest";
import { generateConstantRateInflationIndex } from "../portfolioHistory/inflation";
import {
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestDividendPayoutsGroupedByAsset,
  getTestOrder,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "../dataHelpers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import { History } from "../portfolioHistory/history.entities";
import {
  TEST_ASSET_GOOGLE,
  TEST_ASSET_TESLA,
  TEST_ORDER_1_GOOGLE,
  TEST_ORDER_2_GOOGLE,
  TEST_ORDER_TESLA,
} from "../testConstants";
import {
  getAnnualizedReturn,
  getBuyValueHistoryForPortfolio,
  getLatestPriceFromTransactions,
  getMarketValue,
  getMarketValueHistory,
  getNonRealizedGainsForIsin,
  getOrderFeesOfIsinInPortfolio,
  getPortfolioAgeYears,
  getRealAnnualizedReturn,
  getRealizedGainsForIsin,
  getTotalCashFlow,
  isOrderValidForPortfolio,
  portfolioContainsOrder,
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
  payouts: Partial<DividendPayout>[]
): Portfolio =>
  getTestPortfolio({
    orders: getElementsGroupedByAsset(orders.map(getTestOrder)),
    dividendPayouts: getElementsGroupedByAsset(
      payouts.map(getTestDividendPayout)
    ),
  });

describe("The Portfolio deriver", () => {
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

  describe("isOrderValidForPortfolio", () => {
    const earlyDate = new Date("2024-06-01").toISOString();
    const middleDate = new Date("2024-06-02").toISOString();
    const laterDate = new Date("2024-06-03").toISOString();
    describe("for a buy order", () => {
      it("returns true if the portfolio is empty", () => {
        expect(
          isOrderValidForPortfolio(
            getTestPortfolio({}),
            getTestOrder({ pieces: 5 })
          )
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
            getTestOrder({ timestamp: earlyDate, pieces: 1 })
          )
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
            getTestOrder({ timestamp: laterDate, pieces: 1 })
          )
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
            })
          )
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
            })
          )
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
            })
          )
        ).toBe(true);
      });
    });
  });

  describe("getRealizedGainsForIsin", () => {
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
        ]
      );

      expect(getRealizedGainsForIsin(portfolio, "asset")).toEqual(82);
    });
  });

  describe("getNonRealizedGainsForIsin", () => {
    it("calculates the correct value for a complex scenario", () => {
      const day1 = "2024-06-01";
      const day2 = "2024-06-02";
      const day3 = "2024-06-03";
      const day4 = "2024-06-04";
      const portfolio = createTestPortfolio(
        [
          {
            asset: "asset",
            sharePrice: 100,
            pieces: 10,
            orderFee: 2,
            taxes: 0,
            timestamp: day1,
          },
          {
            asset: "asset",
            sharePrice: 105,
            pieces: 10,
            orderFee: 4,
            taxes: 0,
            timestamp: day2,
          },
          {
            asset: "asset",
            sharePrice: 110,
            pieces: -15,
            orderFee: 2,
            taxes: 3,
            timestamp: day4,
          },
        ],
        [
          // should not be used
          {
            pieces: 20,
            dividendPerShare: 0.25,
            taxes: 0.5,
            asset: "asset",
            timestamp: day3,
          },
        ]
      );

      expect(getNonRealizedGainsForIsin(portfolio, "asset", 110)).toEqual(23);
    });
  });

  describe("portfolioContainsOrder", () => {
    const testOrder: Order = {
      asset: "asset",
      orderFee: 10,
      pieces: 11,
      sharePrice: 12,
      taxes: 9,
      timestamp: "2024-03-04T04:03:01",
      uuid: "unique",
    };
    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset([testOrder]),
    });

    it("returns true for two identical orders", () => {
      expect(portfolioContainsOrder(portfolio, testOrder)).toBe(true);
    });

    it("returns true for two identical orders that only differ in order time on same day", () => {
      expect(
        portfolioContainsOrder(portfolio, {
          ...testOrder,
          timestamp: "2024-03-04T06:04:11",
        })
      ).toBe(true);
    });

    it("returns false for two orders with same timestamp but different taxes", () => {
      expect(
        portfolioContainsOrder(portfolio, {
          ...testOrder,
          taxes: 42,
        })
      ).toBe(false);
    });
  });

  describe("getLatestPriceFromTransactions", () => {
    it("returns the latest price independent of order of recording, ignoring dividend payouts", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "asset",
            pieces: -0.1,
            sharePrice: 1.1,
            timestamp: "2024-03-01T00:00:00",
          },
          {
            asset: "asset",
            pieces: -10,
            sharePrice: 10.1,
            timestamp: "2024-04-01T00:00:00",
          },
          {
            asset: "asset",
            pieces: 11,
            sharePrice: 11.1,
            timestamp: "2024-01-01T00:00:00",
          },
          {
            asset: "otherAsset",
            pieces: 12.12,
            sharePrice: 12.12,
            timestamp: "2025-01-01T00:00:00",
          },
        ]),
        dividendPayouts: getTestDividendPayoutsGroupedByAsset([
          {
            asset: "asset",
            dividendPerShare: 3,
            pieces: 3,
            timestamp: "2024-04-02T00:00:)0",
          },
        ]),
      });

      expect(getLatestPriceFromTransactions(portfolio, "asset")).toEqual(10.1);
    });
  });

  describe("getMarketValueHistory", () => {
    const DAY1 = "2020-03-01";
    const DAY2 = "2020-03-02";
    const DAY3 = "2020-03-03";
    const DAY4 = "2020-03-04";
    const DAY5 = "2020-03-05";
    const xAxis = [DAY1, DAY2, DAY3, DAY4, DAY5].map((d) =>
      new Date(d).getTime()
    );
    vi.useFakeTimers().setSystemTime(DAY5);

    it("when online prices are available", () => {
      const orders = getTestOrdersGroupedByAsset([
        { asset: "a1", pieces: 1, sharePrice: 100, timestamp: DAY1 },
        { asset: "a2", pieces: 1, sharePrice: 10, timestamp: DAY2 },
        { asset: "a1", pieces: -1, sharePrice: 103, timestamp: DAY4 },
      ]);

      const portfolio = getTestPortfolio({ orders });
      const priceMap: Record<string, History<number>> = {
        a1: [
          { timestamp: xAxis[0], value: 100 },
          { timestamp: xAxis[1], value: 101 },
          { timestamp: xAxis[2], value: 102 },
          { timestamp: xAxis[3], value: 103 },
          { timestamp: xAxis[4], value: 104 },
        ],
        a2: [
          { timestamp: xAxis[0], value: 10.0 },
          { timestamp: xAxis[1], value: 10.1 },
          { timestamp: xAxis[2], value: 10.2 },
          { timestamp: xAxis[3], value: 10.3 },
          { timestamp: xAxis[4], value: 10.4 },
        ],
      };

      expect(getMarketValueHistory(portfolio, priceMap, xAxis)).toEqual([
        { timestamp: xAxis[0], value: 100 },
        { timestamp: xAxis[1], value: 101 + 10 }, // transaction price has priority over online price
        { timestamp: xAxis[2], value: 102 + 10.2 },
        { timestamp: xAxis[3], value: 10.3 },
        { timestamp: xAxis[4], value: 10.4 },
      ]);
    });

    it("when some online prices are missing", () => {
      const orders = getTestOrdersGroupedByAsset([
        { asset: "a1", pieces: 1, sharePrice: 100, timestamp: DAY1 },
        { asset: "a2", pieces: 1, sharePrice: 10, timestamp: DAY2 },
        { asset: "a1", pieces: -1, sharePrice: 103, timestamp: DAY4 },
      ]);

      const portfolio = getTestPortfolio({ orders });
      const priceMap: Record<string, History<number>> = {
        a1: [],
        a2: [
          { timestamp: xAxis[0], value: 10.0 },
          { timestamp: xAxis[1], value: 10.1 },
          { timestamp: xAxis[2], value: 10.2 },
          { timestamp: xAxis[3], value: 10.3 },
          { timestamp: xAxis[4], value: 10.4 },
        ],
      };

      expect(getMarketValueHistory(portfolio, priceMap, xAxis)).toEqual([
        { timestamp: xAxis[0], value: 100 },
        { timestamp: xAxis[1], value: 100 + 10 },
        { timestamp: xAxis[2], value: 100 + 10.2 },
        { timestamp: xAxis[3], value: 10.3 },
        { timestamp: xAxis[4], value: 10.4 },
      ]);
    });
  });

  describe("getTotalCashFlow", () => {
    it("returns the final accumulated cash flow of the portfolio", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            timestamp: "2024-01-01",
            sharePrice: 100,
            pieces: 10,
            orderFee: 1,
            taxes: 0,
          },
          {
            asset: "a1",
            timestamp: "2024-02-01",
            sharePrice: 110,
            pieces: -5,
            orderFee: 2,
            taxes: 3,
          },
        ]),
        dividendPayouts: getTestDividendPayoutsGroupedByAsset([
          {
            asset: "a1",
            pieces: 5,
            dividendPerShare: 2,
            taxes: 1,
            timestamp: "2024-01-15",
          },
        ]),
      });

      // buy: +(100*10 + 1) = 1001
      // dividend: -(5*2 - 1) = -9
      // sell: +(-110*5 + 2 + 3) = -545
      const expected = 1001 - 9 - 545;

      expect(getTotalCashFlow(portfolio)).toEqual(expected);
    });

    it("returns 0 for a portfolio with no orders", () => {
      expect(getTotalCashFlow(getTestPortfolio({}))).toBe(0);
    });
  });

  describe("getMarketValue", () => {
    const DAY1 = "2020-03-01";
    const DAY2 = "2020-03-02";
    const DAY3 = "2020-03-03";
    const DAY4 = "2020-03-04";
    const DAY5 = "2020-03-05";

    it("sums pieces times price across isins at the given timestamp", () => {
      const orders = getTestOrdersGroupedByAsset([
        { asset: "a1", pieces: 1, sharePrice: 100, timestamp: DAY1 },
        { asset: "a2", pieces: 1, sharePrice: 10, timestamp: DAY2 },
        { asset: "a1", pieces: -1, sharePrice: 103, timestamp: DAY4 },
      ]);

      const portfolio = getTestPortfolio({ orders });
      const priceMap: Record<string, History<number>> = {
        a1: [
          { timestamp: new Date(DAY1).getTime(), value: 100 },
          { timestamp: new Date(DAY2).getTime(), value: 101 },
          { timestamp: new Date(DAY3).getTime(), value: 102 },
          { timestamp: new Date(DAY4).getTime(), value: 103 },
          { timestamp: new Date(DAY5).getTime(), value: 104 },
        ],
        a2: [
          { timestamp: new Date(DAY1).getTime(), value: 10.0 },
          { timestamp: new Date(DAY2).getTime(), value: 10.1 },
          { timestamp: new Date(DAY3).getTime(), value: 10.2 },
          { timestamp: new Date(DAY4).getTime(), value: 10.3 },
          { timestamp: new Date(DAY5).getTime(), value: 10.4 },
        ],
      };

      // a1 was sold (0 pieces open), a2 has 1 piece @ 10.4
      expect(
        getMarketValue(portfolio, priceMap, new Date(DAY5).getTime())
      ).toBeCloseTo(10.4, 6);
    });

    it("uses the latest transaction price when online prices are missing", () => {
      const orders = getTestOrdersGroupedByAsset([
        { asset: "a1", pieces: 10, sharePrice: 100, timestamp: DAY1 },
        { asset: "b1", pieces: 5, sharePrice: 200, timestamp: DAY2 },
      ]);

      const portfolio = getTestPortfolio({ orders });
      const priceMap: Record<string, History<number>> = {
        a1: [],
        b1: [],
      };

      expect(
        getMarketValue(portfolio, priceMap, new Date(DAY5).getTime())
      ).toBe(10 * 100 + 5 * 200);
    });

    it("defaults timestamp to Date.now()", () => {
      vi.setSystemTime(DAY5);

      const orders = getTestOrdersGroupedByAsset([
        { asset: "a1", pieces: 2, sharePrice: 50, timestamp: DAY1 },
      ]);

      const portfolio = getTestPortfolio({ orders });
      const priceMap: Record<string, History<number>> = {
        a1: [{ timestamp: new Date(DAY5).getTime(), value: 42 }],
      };

      expect(getMarketValue(portfolio, priceMap)).toBe(2 * 42);

      vi.useRealTimers();
    });
  });

  describe("getBuyValueHistory", () => {
    const DAY1 = "2023-01-01";
    const DAY2 = "2023-01-02";
    const DAY3 = "2023-01-03";

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

      expect(getBuyValueHistoryForPortfolio(TEST_PORTFOLIO)).toEqual(
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

      expect(getBuyValueHistoryForPortfolio(TEST_PORTFOLIO)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 20 },
          { timestamp: DAY2, value: 25 },
          { timestamp: DAY3, value: 20 },
        ])
      );
    });
  });

  describe("getPortfolioAgeYears", () => {
    beforeEach(() => vi.setSystemTime("2024-01-01"));

    it("returns the age in years since the first order", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          { asset: "a1", timestamp: "2022-01-01", pieces: 1, sharePrice: 10 },
        ]),
      });

      expect(getPortfolioAgeYears(portfolio)).toBeCloseTo(2, 1);
    });

    it("returns undefined for a portfolio with no orders", () => {
      expect(getPortfolioAgeYears(getTestPortfolio({}))).toBeUndefined();
    });

    it("uses the earliest order timestamp", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          { asset: "a1", timestamp: "2023-01-01", pieces: 1, sharePrice: 10 },
          { asset: "a2", timestamp: "2022-01-01", pieces: 1, sharePrice: 10 },
        ]),
      });

      expect(getPortfolioAgeYears(portfolio)).toBeCloseTo(2, 1);
    });
  });

  describe("getAnnualizedReturn", () => {
    it("returns the geometric annualization of the total return", () => {
      expect(getAnnualizedReturn(1.21, 2)).toBeCloseTo(1.1, 6);
    });

    it("returns undefined when age is zero", () => {
      expect(getAnnualizedReturn(1.5, 0)).toBeUndefined();
    });

    it("returns undefined when age is negative", () => {
      expect(getAnnualizedReturn(1.5, -1)).toBeUndefined();
    });
  });

  describe("getRealAnnualizedReturn", () => {
    const DAY1 = "2020-03-01";
    beforeEach(() => vi.setSystemTime("2020-07-01"));

    const portfolio = getTestPortfolio({
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          timestamp: DAY1,
          pieces: 10,
          sharePrice: 100,
          orderFee: 1,
          taxes: 0,
        },
        {
          asset: "a1",
          timestamp: "2020-04-01",
          pieces: 10,
          sharePrice: 110,
          orderFee: 1,
          taxes: 0,
        },
        {
          asset: "b1",
          timestamp: "2020-05-01",
          pieces: 10,
          sharePrice: 200,
          orderFee: 1,
          taxes: 0,
        },
        {
          asset: "a1",
          timestamp: "2020-05-01",
          pieces: -10,
          sharePrice: 115,
          orderFee: 1,
          taxes: 5,
        },
      ]),
    });
    const priceMap: Record<string, History<number>> = { a1: [], b1: [] };

    it("matches hand-computed deflated TWR annualized", () => {
      const now = new Date("2020-07-01").getTime();
      const startDate = new Date(DAY1).getTime();
      const inflationIndex = generateConstantRateInflationIndex(
        startDate,
        now,
        0.02
      );

      // Hand-computed TWR for this portfolio (priceMap empty -> transaction prices):
      //   t1=2020-03-01: buy  10 a1 @100  -> MV=1000, CF=1001
      //   t2=2020-04-01: buy  10 a1 @110  -> MV=2200, CF=1101
      //   t3=2020-05-01: buy  10 b1 @200, sell 10 a1 @115 -> MV=3150, CF=2001-1144=857
      //   t4=2020-07-01: no cash flow     -> MV=3150, CF=0
      //   r2 = (2200-1101)/1000 = 1.099
      //   r3 = (3150- 857)/2200 = 1.0422727...
      //   r4 = (3150-   0)/3150 = 1
      //   twr = 1.099 * 1.0422727 * 1 = 1.1454577...
      const twr = 1.1454577272727273;

      // Inflation 2% p.a. over ~4 months (1/3 year):
      //   inflationFactor = 1.02^(1/3) = 1.006636...
      //   realTwr = twr / inflationFactor = 1.137906...
      //   age = (t4 - t1) / (ms per 365.25-day year) = 0.334017...
      //   realAnnualized = realTwr^(1/age) = 1.472225...
      //   => 47.22% p.a.
      const age = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);
      const inflationFactor = Math.pow(1.02, age);
      const realTwr = twr / inflationFactor;
      const expectedRealAnnualized = Math.pow(realTwr, 1 / age);

      const realAnnualized = getRealAnnualizedReturn(
        portfolio,
        priceMap,
        inflationIndex,
        now
      );
      expect(realAnnualized).toBeDefined();
      expect(realAnnualized).toBeCloseTo(expectedRealAnnualized, 6);
    });

    it("is less than the nominal annualized return", () => {
      const now = new Date("2020-07-01").getTime();
      const startDate = new Date(DAY1).getTime();
      const age = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

      const twr = 1.1454577272727273;
      const nominalAnnualized = Math.pow(twr, 1 / age);

      const inflationIndex = generateConstantRateInflationIndex(
        startDate,
        now,
        0.02
      );
      const realAnnualized = getRealAnnualizedReturn(
        portfolio,
        priceMap,
        inflationIndex,
        now
      );

      expect(realAnnualized! < nominalAnnualized).toBe(true);
    });

    it("returns undefined when there are no orders", () => {
      const emptyPortfolio = getTestPortfolio({});
      const inflationIndex = generateConstantRateInflationIndex(
        new Date("2020-01-01").getTime(),
        new Date("2020-07-01").getTime(),
        0.02
      );

      expect(
        getRealAnnualizedReturn(emptyPortfolio, {}, inflationIndex)
      ).toBeUndefined();
    });
  });
});

const getValuesAsHistory = (values: { timestamp: string; value: number }[]) =>
  values.map(({ timestamp, value }) => ({
    timestamp: new Date(timestamp).getTime(),
    value,
  }));

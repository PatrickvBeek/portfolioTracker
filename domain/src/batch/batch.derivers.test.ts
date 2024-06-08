import { getTestDividendPayout } from "../dataHelpers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import { TEST_ORDER_TESLA } from "../testConstants";
import {
  getBatches,
  getBatchesHistory,
  getPositionDividendSum,
} from "./batch.derivers";
import { Batches, ClosedBatch, OpenBatch } from "./batch.entities";

function getTestOrder(overrides: Partial<Order>): Order {
  return { ...TEST_ORDER_TESLA, ...overrides };
}

function getTestPayouts(
  overrides: Partial<DividendPayout>[]
): DividendPayout[] {
  return overrides.map(getTestDividendPayout);
}

describe("the portfolio deriver", () => {
  function getTestOrders(orderProps: Partial<Order>[]): Order[] {
    return orderProps.map((prop) => getTestOrder(prop));
  }

  describe("getBatches", () => {
    function getExpectBatches(batches: {
      open: Partial<OpenBatch>[];
      closed: Partial<ClosedBatch>[];
    }): Batches {
      const getDefaultOpenBatch: () => OpenBatch = () => ({
        pieces: TEST_ORDER_TESLA.pieces,
        buyPrice: TEST_ORDER_TESLA.sharePrice,
        buyDate: TEST_ORDER_TESLA.timestamp,
        orderFee: TEST_ORDER_TESLA.orderFee,
        dividendPayouts: [],
        taxes: 0,
      });

      return {
        open: batches.open.map((o) => ({
          ...getDefaultOpenBatch(),
          ...o,
        })),
        closed: batches.closed.map((closed) => ({
          ...getDefaultOpenBatch(),
          sellDate: closed.sellDate || TEST_ORDER_TESLA.timestamp,
          sellPrice: closed.sellPrice || TEST_ORDER_TESLA.sharePrice,
          orderFee: closed.orderFee || 2 * TEST_ORDER_TESLA.orderFee,
          ...closed,
        })),
      };
    }

    describe("returns the correct batches when", () => {
      it("buying 1, selling 1", () => {
        const orders = getTestOrders([
          { pieces: 1, sharePrice: 50 },
          { pieces: -1, sharePrice: 55 },
        ]);

        expect(getBatches(orders, [])).toEqual(
          getExpectBatches({
            open: [],
            closed: [{ pieces: 1, buyPrice: 50, sellPrice: 55 }],
          })
        );
      });

      it("buying 2, selling 1", () => {
        const orders = getTestOrders([
          { pieces: 2, sharePrice: 50 },
          { pieces: -1, sharePrice: 55, taxes: 0.5 },
        ]);

        expect(getBatches(orders, [])).toEqual(
          getExpectBatches({
            open: [{ pieces: 1, buyPrice: 50, orderFee: 0.5 }],
            closed: [
              {
                pieces: 1,
                buyPrice: 50,
                sellPrice: 55,
                orderFee: 1.5,
                taxes: 0.5,
              },
            ],
          })
        );
      });

      it("buying 1,1, selling 2", () => {
        const orders = getTestOrders([
          { pieces: 1, sharePrice: 50 },
          { pieces: 1, sharePrice: 55 },
          { pieces: -2, sharePrice: 60 },
        ]);

        expect(getBatches(orders, [])).toEqual(
          getExpectBatches({
            open: [],
            closed: [
              { pieces: 1, buyPrice: 50, sellPrice: 60, orderFee: 1.5 },
              { pieces: 1, buyPrice: 55, sellPrice: 60, orderFee: 1.5 },
            ],
          })
        );
      });

      it("buying 2, selling 1,1", () => {
        const orders = getTestOrders([
          { pieces: 2, sharePrice: 50 },
          { pieces: -1, sharePrice: 55, taxes: 0.1 },
          { pieces: -1, sharePrice: 60, taxes: 0.2 },
        ]);

        expect(getBatches(orders, [])).toEqual(
          getExpectBatches({
            open: [],
            closed: [
              {
                pieces: 1,
                buyPrice: 50,
                sellPrice: 55,
                orderFee: 1.5,
                taxes: 0.1,
              },
              {
                pieces: 1,
                buyPrice: 50,
                sellPrice: 60,
                orderFee: 1.5,
                taxes: 0.2,
              },
            ],
          })
        );
      });

      it("buying/selling 4,2,-3,-2", () => {
        const orders = getTestOrders([
          { pieces: 4, sharePrice: 50 },
          { pieces: 2, sharePrice: 55 },
          { pieces: -3, sharePrice: 60, orderFee: 3 },
          { pieces: -2, sharePrice: 65 },
        ]);

        expect(getBatches(orders, [])).toEqual(
          getExpectBatches({
            open: [{ pieces: 1, buyPrice: 55, orderFee: 0.5 }],
            closed: [
              { pieces: 3, buyPrice: 50, sellPrice: 60, orderFee: 3.75 },
              { pieces: 1, buyPrice: 50, sellPrice: 65, orderFee: 0.75 },
              { pieces: 1, buyPrice: 55, sellPrice: 65, orderFee: 1 },
            ],
          })
        );
      });
    });

    it("orders are not given chronologically", () => {
      const orders = getTestOrders([
        { pieces: 1, sharePrice: 50, timestamp: "2022-02-01" },
        { pieces: 1, sharePrice: 45, timestamp: "2022-01-15" },
        { pieces: -1, sharePrice: 55, timestamp: "2022-02-15" },
        { pieces: -1, sharePrice: 60, timestamp: "2022-03-01" },
      ]);

      expect(getBatches(orders, [])).toEqual(
        getExpectBatches({
          open: [],
          closed: [
            {
              pieces: 1,
              buyPrice: 45,
              sellPrice: 55,
              buyDate: "2022-01-15",
              sellDate: "2022-02-15",
            },
            {
              pieces: 1,
              buyPrice: 50,
              sellPrice: 60,
              buyDate: "2022-02-01",
              sellDate: "2022-03-01",
            },
          ],
        })
      );
    });

    it("returns undefined if more batches are sold than bought", () => {
      const orders = getTestOrders([
        { pieces: 2, sharePrice: 50 },
        { pieces: -3, sharePrice: 55 },
      ]);

      expect(getBatches(orders, [])).toBeUndefined();
    });
  });

  describe("getBatchesHistory", () => {
    const day1 = "2023-01-01";
    const day2 = "2023-01-02";
    const day3 = "2023-01-03";

    const getTestOrders = (orders: Partial<Order>[]) =>
      orders.map(getTestOrder);

    it("returns a correct history for a buying 1,1 selling 2", () => {
      const TEST_ORDERS = getTestOrders([
        { asset: "abc", pieces: 1, sharePrice: 10, timestamp: day1 },
        { asset: "abc", pieces: 1, sharePrice: 15, timestamp: day2 },
        { asset: "abc", pieces: -2, sharePrice: 20, timestamp: day3 },
      ]);

      expect(getBatchesHistory(TEST_ORDERS)).toEqual([
        {
          date: new Date(day1),
          batches: {
            open: [
              {
                buyDate: day1,
                buyPrice: 10,
                pieces: 1,
                orderFee: 1,
                dividendPayouts: [],
                taxes: 0,
              },
            ],
            closed: [],
          },
        },
        {
          date: new Date(day2),
          batches: {
            open: [
              {
                buyDate: day1,
                buyPrice: 10,
                pieces: 1,
                orderFee: 1,
                dividendPayouts: [],
                taxes: 0,
              },
              {
                buyDate: day2,
                buyPrice: 15,
                pieces: 1,
                orderFee: 1,
                taxes: 0,
                dividendPayouts: [],
              },
            ],
            closed: [],
          },
        },
        {
          date: new Date(day3),
          batches: {
            open: [],
            closed: [
              {
                buyDate: day1,
                buyPrice: 10,
                pieces: 1,
                orderFee: 1.5,
                sellDate: day3,
                sellPrice: 20,
                dividendPayouts: [],
                taxes: 0,
              },
              {
                buyDate: day2,
                buyPrice: 15,
                pieces: 1,
                orderFee: 1.5,
                sellDate: day3,
                sellPrice: 20,
                dividendPayouts: [],
                taxes: 0,
              },
            ],
          },
        },
      ]);
    });

    it("returns empty array if attempting to sell more than available", () => {
      const TEST_ORDERS = getTestOrders([
        { asset: "abc", pieces: 1, sharePrice: 10, timestamp: day1 },
        { asset: "abc", pieces: -2, sharePrice: 15, timestamp: day2 },
        { asset: "abc", pieces: 1, sharePrice: 20, timestamp: day3 },
      ]);

      expect(getBatchesHistory(TEST_ORDERS)).toEqual([]);
    });
  });

  describe("getPositionDividendSum", () => {
    const ISIN = "test-isin";
    const ORDERS = getTestOrders([
      { timestamp: "2024-01-01", asset: ISIN, pieces: 1, sharePrice: 10 },
      { timestamp: "2024-01-03", asset: ISIN, pieces: 2, sharePrice: 15 },
      { timestamp: "2024-01-05", asset: ISIN, pieces: 3, sharePrice: 20 },
      { timestamp: "2024-01-07", asset: ISIN, pieces: -2, sharePrice: 25 },
    ]);

    it("returns 0 if no dividends were recorded", () => {
      expect(getPositionDividendSum(ORDERS, [], "open")).toEqual(0);
      expect(getPositionDividendSum(ORDERS, [], "closed")).toEqual(0);
    });

    it("returns the correct sum for a single dividend", () => {
      const payouts = getTestPayouts([
        {
          timestamp: "2024-01-06",
          asset: ISIN,
          dividendPerShare: 3,
          pieces: 6,
        },
      ]);

      expect(getPositionDividendSum(ORDERS, payouts, "open")).toEqual(12);
      expect(getPositionDividendSum(ORDERS, payouts, "closed")).toEqual(6);
    });

    it("returns the correct sum for multiple payouts", () => {
      const payouts = getTestPayouts([
        {
          timestamp: "2024-01-04",
          asset: ISIN,
          dividendPerShare: 2,
          pieces: 3,
        },
        {
          timestamp: "2024-01-06",
          asset: ISIN,
          dividendPerShare: 3,
          pieces: 6,
        },
      ]);

      expect(getPositionDividendSum(ORDERS, payouts, "open")).toEqual(14);
      expect(getPositionDividendSum(ORDERS, payouts, "closed")).toEqual(10);
    });

    it("returns 0 if no orders where recorded", () => {
      const payouts = getTestPayouts([
        { asset: ISIN, dividendPerShare: 2, pieces: 4 },
      ]);

      expect(getPositionDividendSum([], payouts, "open")).toEqual(0);
    });

    it("returns 0 for an empty portfolio", () => {
      expect(getPositionDividendSum([], [], "open")).toEqual(0);
    });
  });
});

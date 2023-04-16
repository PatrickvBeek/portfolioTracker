import { Order } from "../order/order.entities";
import { TEST_ORDER_TESLA } from "../testConstants";
import { getPositionHistory, getPositions } from "./position.derivers";
import { ClosedPosition, OpenPosition, Positions } from "./position.entities";

function getTestOrder(overrides: Partial<Order>): Order {
  return { ...TEST_ORDER_TESLA, ...overrides };
}

describe("the portfolio deriver", () => {
  function getOrders(orderProps: Partial<Order>[]) {
    return orderProps.map((prop) => getTestOrder(prop));
  }

  describe("getPositions", () => {
    function getExpectPositions(positions: {
      open: Partial<OpenPosition>[];
      closed: Partial<ClosedPosition>[];
    }): Positions {
      const getDefaultOpenPosition: () => OpenPosition = () => ({
        pieces: TEST_ORDER_TESLA.pieces,
        buyPrice: TEST_ORDER_TESLA.sharePrice,
        buyDate: TEST_ORDER_TESLA.timestamp,
        orderFee: TEST_ORDER_TESLA.orderFee,
      });

      return {
        open: positions.open.map((o) => ({
          ...getDefaultOpenPosition(),
          ...o,
        })),
        closed: positions.closed.map((closed) => ({
          ...getDefaultOpenPosition(),
          sellDate: closed.sellDate || TEST_ORDER_TESLA.timestamp,
          sellPrice: closed.sellPrice || TEST_ORDER_TESLA.sharePrice,
          orderFee: closed.orderFee || 2 * TEST_ORDER_TESLA.orderFee,
          ...closed,
        })),
      };
    }

    describe("returns the correct positions when", () => {
      it("buying 1, selling 1", () => {
        const orders = getOrders([
          { pieces: 1, sharePrice: 50 },
          { pieces: -1, sharePrice: 55 },
        ]);

        expect(getPositions(orders)).toEqual(
          getExpectPositions({
            open: [],
            closed: [{ pieces: 1, buyPrice: 50, sellPrice: 55 }],
          })
        );
      });

      it("buying 2, selling 1", () => {
        const orders = getOrders([
          { pieces: 2, sharePrice: 50 },
          { pieces: -1, sharePrice: 55 },
        ]);

        expect(getPositions(orders)).toEqual(
          getExpectPositions({
            open: [{ pieces: 1, buyPrice: 50, orderFee: 0.5 }],
            closed: [{ pieces: 1, buyPrice: 50, sellPrice: 55, orderFee: 1.5 }],
          })
        );
      });

      it("buying 1,1, selling 2", () => {
        const orders = getOrders([
          { pieces: 1, sharePrice: 50 },
          { pieces: 1, sharePrice: 55 },
          { pieces: -2, sharePrice: 60 },
        ]);

        expect(getPositions(orders)).toEqual(
          getExpectPositions({
            open: [],
            closed: [
              { pieces: 1, buyPrice: 50, sellPrice: 60, orderFee: 1.5 },
              { pieces: 1, buyPrice: 55, sellPrice: 60, orderFee: 1.5 },
            ],
          })
        );
      });

      it("buying 2, selling 1,1", () => {
        const orders = getOrders([
          { pieces: 2, sharePrice: 50 },
          { pieces: -1, sharePrice: 55 },
          { pieces: -1, sharePrice: 60 },
        ]);

        expect(getPositions(orders)).toEqual(
          getExpectPositions({
            open: [],
            closed: [
              { pieces: 1, buyPrice: 50, sellPrice: 55, orderFee: 1.5 },
              { pieces: 1, buyPrice: 50, sellPrice: 60, orderFee: 1.5 },
            ],
          })
        );
      });

      it("buying/selling 4,2,-3,-2", () => {
        const orders = getOrders([
          { pieces: 4, sharePrice: 50 },
          { pieces: 2, sharePrice: 55 },
          { pieces: -3, sharePrice: 60, orderFee: 3 },
          { pieces: -2, sharePrice: 65 },
        ]);

        expect(getPositions(orders)).toEqual(
          getExpectPositions({
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
      const orders = getOrders([
        { pieces: 1, sharePrice: 50, timestamp: "2022-02-01" },
        { pieces: 1, sharePrice: 45, timestamp: "2022-01-15" },
        { pieces: -1, sharePrice: 55, timestamp: "2022-02-15" },
        { pieces: -1, sharePrice: 60, timestamp: "2022-03-01" },
      ]);

      expect(getPositions(orders)).toEqual(
        getExpectPositions({
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

    it("returns undefined if more positions are sold than bought", () => {
      const orders = getOrders([
        { pieces: 2, sharePrice: 50 },
        { pieces: -3, sharePrice: 55 },
      ]);

      expect(getPositions(orders)).toBeUndefined();
    });
  });

  describe("getPositionHistory", () => {
    const day1 = "2023-01-01";
    const day2 = "2023-01-02";
    const day3 = "2023-01-03";

    it("returns a correct history for a buying 1,1 selling 2", () => {
      const TEST_ORDERS = getOrders([
        { asset: "abc", pieces: 1, sharePrice: 10, timestamp: day1 },
        { asset: "abc", pieces: 1, sharePrice: 15, timestamp: day2 },
        { asset: "abc", pieces: -2, sharePrice: 20, timestamp: day3 },
      ]);

      expect(getPositionHistory(TEST_ORDERS)).toEqual([
        {
          date: new Date(day1),
          positions: {
            open: [{ buyDate: day1, buyPrice: 10, pieces: 1, orderFee: 1 }],
            closed: [],
          },
        },
        {
          date: new Date(day2),
          positions: {
            open: [
              { buyDate: day1, buyPrice: 10, pieces: 1, orderFee: 1 },
              { buyDate: day2, buyPrice: 15, pieces: 1, orderFee: 1 },
            ],
            closed: [],
          },
        },
        {
          date: new Date(day3),
          positions: {
            open: [],
            closed: [
              {
                buyDate: day1,
                buyPrice: 10,
                pieces: 1,
                orderFee: 1.5,
                sellDate: day3,
                sellPrice: 20,
              },
              {
                buyDate: day2,
                buyPrice: 15,
                pieces: 1,
                orderFee: 1.5,
                sellDate: day3,
                sellPrice: 20,
              },
            ],
          },
        },
      ]);
    });

    it("returns undefined if attempting to sell more than available", () => {
      const TEST_ORDERS = getOrders([
        { asset: "abc", pieces: 1, sharePrice: 10, timestamp: day1 },
        { asset: "abc", pieces: -2, sharePrice: 15, timestamp: day2 },
        { asset: "abc", pieces: 1, sharePrice: 20, timestamp: day3 },
      ]);

      expect(getPositionHistory(TEST_ORDERS)).toBeUndefined();
    });
  });
});

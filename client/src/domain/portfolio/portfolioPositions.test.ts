import { TEST_ORDER_TESLA } from "../testConstants";
import { AssetPositions, ClosedPosition, OpenPosition, Order } from "../types";
import { getPositions } from "./portfolioPositions";

function getTestOrder(overrides: Partial<Order>): Order {
  return { ...TEST_ORDER_TESLA, ...overrides };
}

describe("getPositions", () => {
  function getOrders(orderProps: Partial<Order>[]) {
    return orderProps.map((prop) => getTestOrder(prop));
  }

  function getExpectPositions(positions: {
    open: Partial<OpenPosition>[];
    closed: Partial<ClosedPosition>[];
  }): AssetPositions {
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

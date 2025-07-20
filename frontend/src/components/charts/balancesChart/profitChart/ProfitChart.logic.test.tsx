import {
  AssetLibrary,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  renderAndAwaitQueryHook,
} from "../../../../testUtils/componentHelpers";
import {
  getPriceResponse,
  mockNetwork,
} from "../../../../testUtils/networkMock";
import { useProfitHistory } from "./ProfitChart.logic";

const DAY1 = "2020-03-01";
const DAY2 = "2020-03-02";
const DAY3 = "2020-03-03";
const DAY4 = "2020-03-04";
const TODAY = "2020-03-05";

vi.setSystemTime(TODAY);

mockNetwork({
  prices: getPriceResponse("ABC", [
    [new Date(DAY1), 100],
    [new Date(DAY2), 101],
    [new Date(DAY3), 102],
    [new Date(DAY4), 103],
    [new Date(TODAY), 110],
  ]),
});

describe("useProfitHistory", () => {
  const TIMESTAMPS = [DAY1, DAY2, DAY3, DAY4, TODAY].map((d) =>
    new Date(d).getTime()
  );

  mockNetwork({
    prices: getPriceResponse("ABC", [
      [new Date(DAY1), 100],
      [new Date(DAY2), 101],
      [new Date(DAY3), 102],
      [new Date(DAY4), 103],
      [new Date(TODAY), 110],
    ]),
  });

  it("handles a missing portfolio gracefully", () => {
    const { result } = customRenderHook(() =>
      useProfitHistory("I don't exist")
    );

    expect(result.current.data).toEqual([]);
  });

  it("handles an empty portfolio gracefully", () => {
    const portfolio = getTestPortfolio({
      name: "emptyPortfolio",
      orders: {},
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        emptyPortfolio: portfolio,
      })
    );

    const { result } = customRenderHook(() =>
      useProfitHistory("emptyPortfolio")
    );

    expect(result.current).toEqual({
      isLoading: false,
      isError: false,
      data: [],
    });
  });

  it("calculates profit history for a single order", async () => {
    const portfolio = getTestPortfolio({
      name: "singleOrderPortfolio",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 100,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
      ]),
    });

    const assets: AssetLibrary = {
      a1: { isin: "a1", symbol: "ABC", displayName: "asset 1" },
    };

    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        singleOrderPortfolio: portfolio,
      })
    );

    const result = await renderAndAwaitQueryHook(() =>
      useProfitHistory("singleOrderPortfolio")
    );

    expect(result).toEqual({
      isLoading: false,
      isError: false,
      data: [
        {
          timestamp: TIMESTAMPS[0],
          value: 0,
        },
        {
          timestamp: TIMESTAMPS[4],
          value: 10,
        },
      ],
    });
  });

  it("calculates profit history for multiple orders on the same day", async () => {
    const portfolio = getTestPortfolio({
      name: "multipleOrdersSameDayPortfolio",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 101,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 100,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
      ]),
    });

    const assets: AssetLibrary = {
      a1: { isin: "a1", symbol: "ABC", displayName: "asset 1" },
    };

    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        multipleOrdersSameDayPortfolio: portfolio,
      })
    );

    const result = await renderAndAwaitQueryHook(() =>
      useProfitHistory("multipleOrdersSameDayPortfolio")
    );

    expect(result).toEqual({
      isLoading: false,
      isError: false,
      data: [
        {
          timestamp: TIMESTAMPS[0],
          value: 1, // this behavior is actually a little hard to define if one day is the smallest timescale that the app considers
        },
        {
          timestamp: TIMESTAMPS[4],
          value: 10 + 9,
        },
      ],
    });
  });

  it("calculates profit history for multiple orders on consecutive days", async () => {
    const portfolio = getTestPortfolio({
      name: "consecutiveDaysPortfolio",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 100,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 101,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY2,
        },
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 102,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY3,
        },
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 103,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY4,
        },
      ]),
    });

    const assets: AssetLibrary = {
      a1: { isin: "a1", symbol: "ABC", displayName: "asset 1" },
    };

    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        consecutiveDaysPortfolio: portfolio,
      })
    );

    const result = await renderAndAwaitQueryHook(() =>
      useProfitHistory("consecutiveDaysPortfolio")
    );

    expect(result.data).toEqual([
      {
        timestamp: TIMESTAMPS[0],
        value: 0,
      },
      {
        timestamp: TIMESTAMPS[1],
        value: 1,
      },
      {
        timestamp: TIMESTAMPS[2],
        value: 3,
      },
      {
        timestamp: TIMESTAMPS[3],
        value: 6,
      },
      {
        timestamp: TIMESTAMPS[4],
        value: 10 + 9 + 8 + 7,
      },
    ]);
  });

  it("calculates profit history for multiple orders on non-consecutive days", async () => {
    const portfolio = getTestPortfolio({
      name: "nonConsecutiveDaysPortfolio",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 100,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
        {
          asset: "a1",
          pieces: 1,
          sharePrice: 102,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY3,
        },
      ]),
    });

    const assets: AssetLibrary = {
      a1: { isin: "a1", symbol: "ABC", displayName: "asset 1" },
    };

    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        nonConsecutiveDaysPortfolio: portfolio,
      })
    );

    const result = await renderAndAwaitQueryHook(() =>
      useProfitHistory("nonConsecutiveDaysPortfolio")
    );

    expect(result.data).toEqual([
      {
        timestamp: TIMESTAMPS[0],
        value: 0,
      },
      {
        timestamp: TIMESTAMPS[2],
        value: 2,
      },
      {
        timestamp: TIMESTAMPS[4],
        value: 10 + 8,
      },
    ]);
  });
});

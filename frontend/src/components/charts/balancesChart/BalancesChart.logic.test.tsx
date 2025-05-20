import moment from "moment";
import { AssetLibrary } from "pt-domain/src/asset/asset.entities";
import {
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain/src/dataHelpers";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
  renderAndAwaitQueryHook,
} from "../../../testUtils/componentHelpers";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import {
  useGetPortfolioHistoryChartData,
  useProfitHistory,
} from "./BalancesChart.logic";

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

describe("useGetPortfolioHistoryChartData", () => {
  const TIMESTAMPS = [DAY1, DAY2, DAY3, DAY4].map((d) =>
    moment(d).startOf("day").valueOf()
  );

  it("handles a missing portfolio gracefully", () => {
    const { result } = customRenderHook(() =>
      useGetPortfolioHistoryChartData("I don't exist")
    );

    expect(result.current).toEqual([]);
  });

  it("retrieves and merges data correctly", async () => {
    const portfolio = getTestPortfolio({
      name: "p1",
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
          asset: "a2",
          pieces: 1,
          sharePrice: 10.1,
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
          asset: "a2",
          pieces: 2,
          sharePrice: 10.3,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY4,
        },
      ]),
    });

    const assets: AssetLibrary = {
      a1: { isin: "a1", symbol: "ABC", displayName: "asset 1" },
      a2: { isin: "a2", symbol: "", displayName: "asset 2" },
    };

    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        p1: portfolio,
      })
    );

    const { result } = customRenderHook(() =>
      useGetPortfolioHistoryChartData("p1")
    );

    await customWaitFor(() => {
      expect(result.current[0]).toHaveProperty("marketValue");
    });

    expect(result.current).toEqual([
      {
        buyValue: 100,
        cashFlow: 100,
        marketValue: 100,
        timestamp: TIMESTAMPS[0],
      },
      {
        buyValue: 110.1,
        cashFlow: 110.1,
        marketValue: 111.1,
        timestamp: TIMESTAMPS[1],
      },
      {
        buyValue: 212.1,
        cashFlow: 212.1,
        marketValue: 2 * 102 + 10.1,
        timestamp: TIMESTAMPS[2],
      },
      {
        buyValue: 232.7,
        cashFlow: 232.7,
        marketValue: 2 * 103 + 3 * 10.3,
        timestamp: TIMESTAMPS[3],
      },
      {
        buyValue: 232.7,
        cashFlow: 232.7,
        marketValue: 2 * 110 + 3 * 10.3,
        timestamp: moment(TODAY).startOf("day").valueOf(),
      },
    ]);
  });
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

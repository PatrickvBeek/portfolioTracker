import moment from "moment";
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
import {
  useGetBuyValueHistory,
  useGetPortfolioHistoryChartData,
} from "./TotalValueChart.logic";

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

  it("handles a missing portfolio gracefully", async () => {
    const result = await renderAndAwaitQueryHook(() =>
      useGetPortfolioHistoryChartData(["I don't exist"])
    );

    expect(result.data).toEqual([]);
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

    const result = renderAndAwaitQueryHook(() =>
      useGetPortfolioHistoryChartData(["p1"])
    );

    expect((await result).data).toEqual([
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

describe("useGetBuyValueHistory", () => {
  const ts = (dateStr: string) => new Date(dateStr).getTime();

  it("returns correct sum for multiple portfolios with different assets", () => {
    const portfolio1 = getTestPortfolio({
      name: "p1",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 10,
          sharePrice: 100,
          timestamp: DAY1,
        },
      ]),
    });

    const portfolio2 = getTestPortfolio({
      name: "p2",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a2",
          pieces: 5,
          sharePrice: 50,
          timestamp: DAY2,
        },
      ]),
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        p1: portfolio1,
        p2: portfolio2,
      })
    );

    const { result } = customRenderHook(() =>
      useGetBuyValueHistory(["p1", "p2"])
    );

    expect(result.current).toEqual([
      { timestamp: ts(DAY1), value: 1000 },
      { timestamp: ts(DAY2), value: 1250 },
    ]);
  });

  it("handles interleaved orders correctly - FIFO isolated per portfolio", () => {
    const portfolio1 = getTestPortfolio({
      name: "p1",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 10,
          sharePrice: 100,
          timestamp: DAY1,
        },
        {
          asset: "a1",
          pieces: -10,
          sharePrice: 120,
          timestamp: DAY3,
        },
      ]),
    });

    const portfolio2 = getTestPortfolio({
      name: "p2",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 10,
          sharePrice: 150,
          timestamp: DAY2,
        },
        {
          asset: "a1",
          pieces: -10,
          sharePrice: 160,
          timestamp: DAY4,
        },
      ]),
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        p1: portfolio1,
        p2: portfolio2,
      })
    );

    const { result } = customRenderHook(() =>
      useGetBuyValueHistory(["p1", "p2"])
    );

    expect(result.current).toEqual([
      { timestamp: ts(DAY1), value: 1000 },
      { timestamp: ts(DAY2), value: 2500 },
      { timestamp: ts(DAY3), value: 1500 },
      { timestamp: ts(DAY4), value: 0 },
    ]);
  });

  it("handles one empty portfolio gracefully", () => {
    const portfolio1 = getTestPortfolio({
      name: "p1",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          pieces: 5,
          sharePrice: 200,
          timestamp: DAY1,
        },
      ]),
    });

    const portfolio2 = getTestPortfolio({
      name: "p2",
      orders: {},
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        p1: portfolio1,
        p2: portfolio2,
      })
    );

    const { result } = customRenderHook(() =>
      useGetBuyValueHistory(["p1", "p2"])
    );

    expect(result.current).toEqual([{ timestamp: ts(DAY1), value: 1000 }]);
  });

  it("returns empty array for empty portfolios", () => {
    const portfolio1 = getTestPortfolio({
      name: "p1",
      orders: {},
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        p1: portfolio1,
      })
    );

    const { result } = customRenderHook(() => useGetBuyValueHistory(["p1"]));

    expect(result.current).toEqual([]);
  });
});

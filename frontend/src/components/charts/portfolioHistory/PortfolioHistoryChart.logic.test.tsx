import { waitFor } from "@testing-library/react";
import { AssetLibrary } from "pt-domain/src/asset/asset.entities";
import {
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain/src/dataHelpers";
import { vi } from "vitest";
import { customRenderHook } from "../../../testUtils/componentHelpers";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import { useGetPortfolioHistoryChartData } from "./PortfolioHistoryChart.logic";

describe("useGetPortfolioHistoryChartData", () => {
  const DAY1 = "2020-03-01";
  const DAY2 = "2020-03-02";
  const DAY3 = "2020-03-03";
  const DAY4 = "2020-03-04";
  const TODAY = "2020-03-05";

  vi.setSystemTime(TODAY);

  const TIMESTAMPS = [DAY1, DAY2, DAY3, DAY4].map((d) => new Date(d).getTime());

  mockNetwork({
    prices: getPriceResponse("ABC", [
      [new Date(DAY1), 100],
      [new Date(DAY2), 101],
      [new Date(DAY3), 102],
      [new Date(DAY4), 103],
      [new Date(TODAY), 110],
    ]),
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

    await waitFor(() => {
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
        timestamp: new Date(TODAY).getTime(),
      },
    ]);
  });
});

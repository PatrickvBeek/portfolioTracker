import moment from "moment";
import {
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain/src/dataHelpers";
import { vi } from "vitest";
import { renderAndAwaitQueryHook } from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import { ChartData } from "../chartTypes";
import { usePerformanceChartData } from "./TimeWeightedReturnChart.logic";

const ASSET = "asset1";
const BENCHMARK = "benchmark";

const assetLib = {
  [ASSET]: { isin: ASSET, displayName: "not relevant", symbol: "a" },
  [BENCHMARK]: { isin: BENCHMARK, displayName: "not relevant", symbol: "b1" },
};

const DAY1 = new Date("2000-01-01");
const DAY2 = new Date("2000-01-02");
const DAY3 = new Date("2000-01-03");
const DAY4 = new Date("2000-01-04");
const TODAY = new Date("2000-01-05");

const DAY_BEFORE_1 = new Date("1999-12-31");

const portfolio = getTestPortfolio({
  orders: getTestOrdersGroupedByAsset([
    {
      asset: ASSET,
      pieces: 1,
      sharePrice: 100,
      taxes: 0,
      orderFee: 0,
      timestamp: DAY1.toISOString(),
    },
    {
      asset: ASSET,
      pieces: 1,
      sharePrice: 101,
      taxes: 0,
      orderFee: 0,
      timestamp: DAY2.toISOString(),
    },
    {
      asset: ASSET,
      pieces: 1,
      sharePrice: 102,
      taxes: 0,
      orderFee: 0,
      timestamp: DAY3.toISOString(),
    },
    {
      asset: ASSET,
      pieces: 1,
      sharePrice: 103,
      taxes: 0,
      orderFee: 0,
      timestamp: DAY4.toISOString(),
    },
  ]),
});

setUserData({
  portfolios: { [portfolio.name]: portfolio },
  assets: assetLib,
});

vi.setSystemTime(TODAY);
const { setBackendData } = mockNetwork({ prices: {} });

describe("the hook", () => {
  describe("usePerformanceChartData", () => {
    it("gracefully handles a non-existing portfolio name", async () => {
      setBackendData({ prices: getPriceResponse("a", []) });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData("does not exist", "does not exist either")
      );

      expect(result).toEqual({
        isError: false,
        isLoading: false,
        data: [],
      });
    });

    it("returns only twr if no benchmark symbol is given", async () => {
      setBackendData({ prices: getPriceResponse("a", []) });
      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData(portfolio.name, "")
      );

      expectChartsAreEqualForKeys(["portfolio"], result.data ?? [], [
        { timestamp: DAY1.getTime(), portfolio: 0 },
        { timestamp: DAY2.getTime(), portfolio: 1 },
        { timestamp: DAY2.getTime(), portfolio: 2 },
        { timestamp: DAY2.getTime(), portfolio: 3 },
        { timestamp: DAY2.getTime(), portfolio: 3 },
      ]);
    });

    it("adjusts benchmark, when benchmark data has longer history", async () => {
      setBackendData({
        prices: getPriceResponse("b1", [
          [new Date(DAY_BEFORE_1), 180],
          [DAY1, 200],
          [DAY2, 202],
          [DAY3, 204],
          [DAY4, 206],
          [TODAY, 208],
        ]),
      });
      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData(portfolio.name, assetLib[BENCHMARK].isin)
      );

      expectChartsAreEqualForKeys(
        ["portfolio", "benchmark"],
        result.data ?? [],
        [
          { timestamp: DAY1.getTime(), benchmark: 0, portfolio: 0 },
          { timestamp: DAY2.getTime(), benchmark: 1, portfolio: 1 },
          { timestamp: DAY3.getTime(), benchmark: 2, portfolio: 2 },
          { timestamp: DAY4.getTime(), benchmark: 3, portfolio: 3 },
          { timestamp: TODAY.getTime(), benchmark: 4, portfolio: 3 },
        ]
      );
    });

    it("adjusts portfolio twr, when portfolio has longer history", async () => {
      setBackendData({
        prices: getPriceResponse("b1", [
          [DAY3, 204],
          [DAY4, 206],
          [TODAY, 208],
        ]),
      });
      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData(portfolio.name, assetLib[BENCHMARK].isin)
      );

      expectChartsAreEqualForKeys(
        ["portfolio", "benchmark"],
        result.data ?? [],
        [
          {
            timestamp: DAY3.getTime(),
            portfolio: 0,
            benchmark: 0,
          },
          {
            timestamp: DAY4.getTime(),
            portfolio: 0.98,
            benchmark: 0.98,
          },
          {
            timestamp: TODAY.getTime(),
            portfolio: 0.98,
            benchmark: 1.96,
          },
        ]
      );
    });
  });
});

function expectChartsAreEqualForKeys<T extends string>(
  keys: T[],
  actual: ChartData<T>,
  expected: ChartData<T>
): void {
  expect(actual).toHaveLength(expected.length);

  for (let i = 0; i < actual.length; i++) {
    const actualPoint = actual[i];
    const expectedPoint = expected[i];

    for (const key of keys) {
      expect(actualPoint[key] ?? 0).toBeCloseTo(expectedPoint[key] ?? 0);
    }
    expect(moment(actualPoint.timestamp).startOf("day").unix).toEqual(
      moment(expectedPoint.timestamp).startOf("day").unix
    );
  }
}

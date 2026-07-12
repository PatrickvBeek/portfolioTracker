import moment from "moment";
import { getTestOrdersGroupedByAsset, getTestPortfolio } from "pt-domain";
import { vi } from "vitest";
import { renderAndAwaitQueryHook } from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import { ChartData } from "../chartTypes";
import { usePerformanceChartData } from "./TimeWeightedReturnChart.logic";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

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

const MATURE_ASSET = "matureAsset";

const MATURE_DAY1 = new Date("1999-10-01");
const MATURE_DAY2 = new Date("2000-01-01");
const MATURE_DAY3 = new Date("2000-01-02");
const MATURE_DAY4 = new Date("2000-01-04");

const maturePortfolio = getTestPortfolio({
  orders: getTestOrdersGroupedByAsset([
    {
      asset: MATURE_ASSET,
      pieces: 1,
      sharePrice: 100,
      taxes: 0,
      orderFee: 0,
      timestamp: MATURE_DAY1.toISOString(),
    },
    {
      asset: MATURE_ASSET,
      pieces: 1,
      sharePrice: 120,
      taxes: 0,
      orderFee: 0,
      timestamp: MATURE_DAY2.toISOString(),
    },
    {
      asset: MATURE_ASSET,
      pieces: 1,
      sharePrice: 122,
      taxes: 0,
      orderFee: 0,
      timestamp: MATURE_DAY3.toISOString(),
    },
    {
      asset: MATURE_ASSET,
      pieces: 1,
      sharePrice: 126,
      taxes: 0,
      orderFee: 0,
      timestamp: MATURE_DAY4.toISOString(),
    },
  ]),
});

const matureAssetLib = {
  [MATURE_ASSET]: {
    isin: MATURE_ASSET,
    displayName: "not relevant",
    symbol: "ma",
  },
};

const allAssets = { ...assetLib, ...matureAssetLib };

setUserData({
  portfolios: {
    [portfolio.name]: portfolio,
    [maturePortfolio.name]: maturePortfolio,
  },
  assets: allAssets,
});

vi.setSystemTime(TODAY);
const { setBackendData } = mockNetwork({ prices: {} });

describe("the hook", () => {
  describe("usePerformanceChartData", () => {
    it("gracefully handles a non-existing portfolio name", async () => {
      setBackendData({ prices: getPriceResponse("a", []) });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData(
          ["does not exist"],
          "does not exist either",
          "Max"
        )
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
        usePerformanceChartData([portfolio.name], "", "Max")
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
        usePerformanceChartData(
          [portfolio.name],
          assetLib[BENCHMARK].isin,
          "Max"
        )
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
        usePerformanceChartData(
          [portfolio.name],
          assetLib[BENCHMARK].isin,
          "Max"
        )
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

  describe("range-relative anchoring", () => {
    // Portfolio with gains both before and after the 1M range boundary.
    // MATURE_DAY1 (Oct 1) is ~96 days before TODAY (Jan 5), well before
    // the 1M range start (Dec 6). Price data creates a 20% gain before
    // the range start and additional gains within the range.
    const ONE_MONTH_MS = 30 * DAY_IN_MS;
    const RANGE_START_DATE = new Date(TODAY.getTime() - ONE_MONTH_MS);

    it("starts at 0% for 1M range when portfolio is older than 1M", async () => {
      // Price at 120 from Oct through Dec creates pre-range gains
      setBackendData({
        prices: getPriceResponse("ma", [
          [MATURE_DAY1, 100],
          [RANGE_START_DATE, 120],
          [MATURE_DAY4, 126],
          [TODAY, 126],
        ]),
      });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([maturePortfolio.name], "", "1M")
      );

      const data = result.data ?? [];
      expect(data.length).toBeGreaterThan(0);

      // The first visible point should be anchored at 0%
      const firstPortfolioValue = data[0].portfolio ?? 0;
      expect(firstPortfolioValue).toBeCloseTo(0, 1);
    });

    it("starts at 0% for Max range", async () => {
      setBackendData({
        prices: getPriceResponse("ma", [
          [MATURE_DAY1, 100],
          [RANGE_START_DATE, 120],
          [MATURE_DAY4, 126],
          [TODAY, 126],
        ]),
      });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([maturePortfolio.name], "", "Max")
      );

      const data = result.data ?? [];
      expect(data.length).toBeGreaterThan(0);

      const firstPortfolioValue = data[0].portfolio ?? 0;
      expect(firstPortfolioValue).toBeCloseTo(0, 1);
    });

    it("1M range shows smaller return than Max at end of range", async () => {
      setBackendData({
        prices: getPriceResponse("ma", [
          [MATURE_DAY1, 100],
          [RANGE_START_DATE, 120],
          [MATURE_DAY4, 126],
          [TODAY, 126],
        ]),
      });

      const maxResult = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([maturePortfolio.name], "", "Max")
      );

      // Re-initialize user data between hook renders to ensure clean state
      setUserData({
        portfolios: {
          [portfolio.name]: portfolio,
          [maturePortfolio.name]: maturePortfolio,
        },
        assets: allAssets,
      });

      const oneMonthResult = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([maturePortfolio.name], "", "1M")
      );

      const maxData = maxResult.data ?? [];
      const oneMonthData = oneMonthResult.data ?? [];

      expect(maxData.length).toBeGreaterThan(0);
      expect(oneMonthData.length).toBeGreaterThan(0);

      const lastMaxValue = maxData[maxData.length - 1].portfolio ?? 0;
      const lastOneMonthValue =
        oneMonthData[oneMonthData.length - 1].portfolio ?? 0;

      // Values may be number or number[] (forecast uncertainty bands)
      const maxNumber = typeof lastMaxValue === "number" ? lastMaxValue : 0;
      const oneMonthNumber =
        typeof lastOneMonthValue === "number" ? lastOneMonthValue : 0;

      // Max shows inception-to-date return (includes Oct→Dec gain)
      // 1M shows only the gain within the 1M window (Dec→Jan)
      expect(maxNumber).toBeGreaterThan(oneMonthNumber);
    });

    it("benchmark also starts at 0% for 1M range", async () => {
      // Use the mature portfolio + benchmark with long history.
      // The 1M range start is Dec 6, portfolio starts Oct 1,
      // benchmark starts even earlier.
      setBackendData({
        prices: {
          ...getPriceResponse("ma", [
            [MATURE_DAY1, 100],
            [RANGE_START_DATE, 120],
            [MATURE_DAY4, 126],
            [TODAY, 126],
          ]),
          ...getPriceResponse("b1", [
            [MATURE_DAY1, 50],
            [RANGE_START_DATE, 60],
            [MATURE_DAY4, 63],
            [TODAY, 63],
          ]),
        },
      });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData(
          [maturePortfolio.name],
          assetLib[BENCHMARK].isin,
          "1M"
        )
      );

      const data = result.data ?? [];
      expect(data.length).toBeGreaterThan(0);

      // The first visible benchmark point should also be anchored at 0%
      const firstBenchmarkValue = data[0].benchmark ?? 0;
      const benchmarkNumber =
        typeof firstBenchmarkValue === "number" ? firstBenchmarkValue : 0;
      expect(benchmarkNumber).toBeCloseTo(0, 1);
    });

    it("1M range first point timestamp is after portfolio inception", async () => {
      setBackendData({
        prices: getPriceResponse("ma", [
          [MATURE_DAY1, 100],
          [RANGE_START_DATE, 120],
          [MATURE_DAY4, 126],
          [TODAY, 126],
        ]),
      });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([maturePortfolio.name], "", "1M")
      );

      const data = result.data ?? [];
      expect(data.length).toBeGreaterThan(0);

      // The first timestamp should be well after the portfolio inception
      // (which is MATURE_DAY1 = Oct 1, months before the 1M range start)
      expect(data[0].timestamp).toBeGreaterThan(
        MATURE_DAY1.getTime() + DAY_IN_MS
      );
    });

    it("falls back to simple filter when no data at range start", async () => {
      // Portfolio starts on DAY1 (Jan 1, 2000), which is within the 1M
      // range (Dec 6 – Jan 5). Since the portfolio inception is after
      // the 1M range start, pickValueFromHistory returns undefined and
      // the fallback path (simple filter) is taken.
      setBackendData({
        prices: getPriceResponse("a", [
          [DAY1, 100],
          [DAY2, 101],
          [DAY3, 102],
          [DAY4, 103],
          [TODAY, 103],
        ]),
      });

      const result = await renderAndAwaitQueryHook(() =>
        usePerformanceChartData([portfolio.name], "", "1M")
      );

      const data = result.data ?? [];
      expect(data.length).toBeGreaterThan(0);

      // Since the portfolio starts within the range, no anchoring is
      // needed and the first point should still be at 0% (inception)
      const firstPortfolioValue = data[0].portfolio ?? 0;
      expect(firstPortfolioValue).toBeCloseTo(0, 1);
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
      const actualValue = actualPoint[key] ?? 0;
      const expectedValue = expectedPoint[key] ?? 0;

      // Handle both number and number[] values (for forecast charts with uncertainty bands)
      const actualNumber =
        typeof actualValue === "number" ? actualValue : (actualValue[0] ?? 0);
      const expectedNumber =
        typeof expectedValue === "number"
          ? expectedValue
          : (expectedValue[0] ?? 0);

      expect(actualNumber).toBeCloseTo(expectedNumber);
    }
    // oxlint-disable-next-line typescript-eslint/unbound-method
    expect(moment(actualPoint.timestamp).startOf("day").unix).toEqual(
      // oxlint-disable-next-line typescript-eslint/unbound-method
      moment(expectedPoint.timestamp).startOf("day").unix
    );
  }
}

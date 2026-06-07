import { History } from "pt-domain";
import { waitFor } from "@testing-library/react";
import { vi } from "vitest";
import {
  getFilteredPriceHistory,
  useAssetPriceChartData,
} from "./AssetPriceHistory.logic";
import { customRenderHook } from "../../../testUtils/componentHelpers";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import { CHART_RANGES } from "../../charts/chartRange.types";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const NOW = new Date("2024-06-15").getTime();
vi.setSystemTime(NOW);

const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;

const makeHistory = (daysAgo: number[], value: number = 100): History<number> =>
  daysAgo.map((d) => ({ timestamp: NOW - d * DAY_IN_MS, value }));

describe("getFilteredPriceHistory", () => {
  it("returns all data for Max range", () => {
    const prices = makeHistory([1, 10, 100, 1000]);
    const result = getFilteredPriceHistory(prices, "Max");

    expect(result.data).toHaveLength(4);
  });

  it("filters to last 30 days for 1M range", () => {
    const prices = makeHistory([5, 31, 60]);
    const result = getFilteredPriceHistory(prices, "1M");

    expect(result.data).toHaveLength(1);
    expect(result.data[0].timestamp).toBe(NOW - 5 * DAY_IN_MS);
  });

  it("filters to last 90 days for 3M range", () => {
    const prices = makeHistory([50, 100]);
    const result = getFilteredPriceHistory(prices, "3M");

    expect(result.data).toHaveLength(1);
  });

  it("returns the oldest price in range as baseline", () => {
    const prices: History<number> = [
      { timestamp: NOW - 5 * DAY_IN_MS, value: 150 },
      { timestamp: NOW - 15 * DAY_IN_MS, value: 120 },
      { timestamp: NOW - 25 * DAY_IN_MS, value: 100 },
    ];
    const result = getFilteredPriceHistory(prices, "1M");

    expect(result.baseline).toBe(100);
  });

  it("returns baseline 0 when there is no data", () => {
    const result = getFilteredPriceHistory(undefined, "1M");

    expect(result.data).toHaveLength(0);
    expect(result.baseline).toBe(0);
  });
});

const GOOGL_PRICES = getPriceResponse("GOOGL", [
  [new Date(NOW - 12 * msPerMonth), 100],
  [new Date(NOW - 11 * msPerMonth), 102],
  [new Date(NOW - 10 * msPerMonth), 104.04],
  [new Date(NOW - 9 * msPerMonth), 106.12],
  [new Date(NOW - 8 * msPerMonth), 108.24],
  [new Date(NOW - 7 * msPerMonth), 110.41],
  [new Date(NOW - 6 * msPerMonth), 112.62],
  [new Date(NOW - 5 * msPerMonth), 114.87],
  [new Date(NOW - 4 * msPerMonth), 117.17],
  [new Date(NOW - 3 * msPerMonth), 119.51],
  [new Date(NOW - 2 * msPerMonth), 121.9],
  [new Date(NOW - 1 * msPerMonth), 124.34],
  [new Date(NOW), 126.82],
]);

describe("useAssetPriceChartData", () => {
  mockNetwork({ prices: GOOGL_PRICES });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns chart data and stats for a symbol with price data", async () => {
    const { result } = customRenderHook(() =>
      useAssetPriceChartData("GOOGL", CHART_RANGES.Max)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats!.annualizedReturn).toBeDefined();
    expect(result.current.stats!.annualizedVolatility).toBeDefined();
    expect(result.current.stats!.ratio).toBeDefined();
  });

  it("returns undefined stats when there is insufficient data", async () => {
    const singlePoint = getPriceResponse("SINGLE", [[new Date(NOW), 100]]);
    mockNetwork({ prices: singlePoint });

    const { result } = customRenderHook(() =>
      useAssetPriceChartData("SINGLE", CHART_RANGES.Max)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeUndefined();
  });

  it("returns baseline from the filtered range", async () => {
    const { result } = customRenderHook(() =>
      useAssetPriceChartData("GOOGL", CHART_RANGES.Max)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.baseline).toBeDefined();
  });
});

import { History } from "pt-domain";
import { vi } from "vitest";
import { getFilteredPriceHistory } from "./AssetPriceHistory.logic";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const NOW = new Date("2024-06-15").getTime();
vi.setSystemTime(NOW);

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

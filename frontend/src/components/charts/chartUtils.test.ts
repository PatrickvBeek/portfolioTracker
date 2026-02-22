import moment from "moment";
import { vi } from "vitest";
import { ChartRange } from "./chartRange.types";
import { ChartData } from "./chartTypes";
import { filterChartDataByRange } from "./chartUtils";

const TODAY = "2020-03-05";
vi.setSystemTime(TODAY);

const createTestData = (daysAgo: number[]): ChartData<"value"> => {
  const todayTimestamp = moment(TODAY).startOf("day").valueOf();
  return daysAgo.map((days, index) => ({
    timestamp: todayTimestamp - days * 24 * 60 * 60 * 1000,
    value: index + 1,
  }));
};

describe("filterChartDataByRange", () => {
  it("returns unmodified data for Max range", () => {
    const data = createTestData([0, 10, 30, 100]);

    const result = filterChartDataByRange(data, "Max");

    expect(result).toEqual(data);
  });

  it("returns empty array unchanged", () => {
    const result = filterChartDataByRange([], "1M");

    expect(result).toEqual([]);
  });

  it("filters to last 30 days for 1M range", () => {
    const data = createTestData([0, 15, 29, 30, 31, 60]);

    const result = filterChartDataByRange(data, "1M");

    expect(result).toHaveLength(4);
    expect(result.map((d) => d.value)).toEqual([1, 2, 3, 4]);
  });

  it("filters to last 90 days for 3M range", () => {
    const data = createTestData([0, 30, 89, 90, 91, 120]);

    const result = filterChartDataByRange(data, "3M");

    expect(result).toHaveLength(4);
    expect(result.map((d) => d.value)).toEqual([1, 2, 3, 4]);
  });

  it("filters to last 365 days for 1Y range", () => {
    const data = createTestData([0, 100, 364, 365, 366]);

    const result = filterChartDataByRange(data, "1Y");

    expect(result).toHaveLength(4);
    expect(result.map((d) => d.value)).toEqual([1, 2, 3, 4]);
  });

  it("filters to last 1095 days for 3Y range", () => {
    const data = createTestData([0, 365, 1094, 1095, 1096]);

    const result = filterChartDataByRange(data, "3Y");

    expect(result).toHaveLength(4);
    expect(result.map((d) => d.value)).toEqual([1, 2, 3, 4]);
  });

  it("filters to last 3650 days for 10Y range", () => {
    const data = createTestData([0, 1000, 3649, 3650, 3651]);

    const result = filterChartDataByRange(data, "10Y");

    expect(result).toHaveLength(4);
    expect(result.map((d) => d.value)).toEqual([1, 2, 3, 4]);
  });

  it("handles data smaller than requested range", () => {
    const data = createTestData([0, 5, 10]);

    const result = filterChartDataByRange(data, "10Y" as ChartRange);

    expect(result).toEqual(data);
  });

  it("includes data point at boundary", () => {
    const todayTimestamp = moment(TODAY).startOf("day").valueOf();
    const boundaryTimestamp = todayTimestamp - 30 * 24 * 60 * 60 * 1000;
    const data = [
      { timestamp: boundaryTimestamp, value: 1 },
      { timestamp: boundaryTimestamp - 1, value: 2 },
    ];

    const result = filterChartDataByRange(data, "1M");

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(1);
  });

  it("does not mutate original data", () => {
    const data = createTestData([0, 15, 60]);
    const originalData = [...data];

    filterChartDataByRange(data, "1M");

    expect(data).toEqual(originalData);
  });
});

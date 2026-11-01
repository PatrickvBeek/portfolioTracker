import {
  deriveMonthlyContribution,
  transformForecastToChartData,
} from "./forecastChartUtils";

describe("deriveMonthlyContribution", () => {
  it("rounds the average monthly cash flow to the nearest 50", () => {
    expect(deriveMonthlyContribution(10_000, 1)).toBe(850);
    expect(deriveMonthlyContribution(12_000, 2)).toBe(500);
  });

  it("clamps a negative cash flow to zero", () => {
    expect(deriveMonthlyContribution(-59_000, 2)).toBe(0);
  });

  it("returns a number for a real zero cash flow", () => {
    expect(deriveMonthlyContribution(0, 2)).toBe(0);
  });

  it("returns undefined without a usable portfolio age", () => {
    expect(deriveMonthlyContribution(10_000, 0)).toBeUndefined();
    expect(deriveMonthlyContribution(10_000, NaN)).toBeUndefined();
  });

  it("returns undefined for a non-finite cash flow", () => {
    expect(deriveMonthlyContribution(NaN, 2)).toBeUndefined();
  });
});

describe("transformForecastToChartData", () => {
  it("steps timestamps by calendar month", () => {
    const start = new Date(2021, 0, 31).getTime();
    const result = transformForecastToChartData(
      {
        median: [1, 2, 3],
        confidenceLow: [0, 1, 2],
        confidenceHigh: [2, 3, 4],
        cashFlows: [0, 0, 0],
      },
      start,
      0,
      0
    );

    expect(result.map((point) => point.timestamp)).toEqual([
      new Date(2021, 1, 1).getTime(),
      new Date(2021, 2, 1).getTime(),
      new Date(2021, 3, 1).getTime(),
    ]);
  });
});

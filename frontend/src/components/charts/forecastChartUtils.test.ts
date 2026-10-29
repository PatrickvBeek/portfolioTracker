import { deriveMonthlyContribution } from "./forecastChartUtils";

describe("deriveMonthlyContribution", () => {
  it("rounds the average monthly cash flow to the nearest 50", () => {
    expect(deriveMonthlyContribution(10_000, 1)).toBe(850);
    expect(deriveMonthlyContribution(12_000, 2)).toBe(500);
  });

  it("clamps a negative cash flow to zero", () => {
    expect(deriveMonthlyContribution(-59_000, 2)).toBe(0);
  });

  it("returns zero without a usable portfolio age", () => {
    expect(deriveMonthlyContribution(10_000, 0)).toBe(0);
    expect(deriveMonthlyContribution(10_000, NaN)).toBe(0);
  });

  it("returns zero for a non-finite cash flow", () => {
    expect(deriveMonthlyContribution(NaN, 2)).toBe(0);
  });
});

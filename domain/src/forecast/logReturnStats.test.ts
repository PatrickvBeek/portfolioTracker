import { describe, expect, it } from "vitest";
import { History } from "../portfolioHistory/history.entities";
import {
  getAssetReturnAndVolatility,
  getLogReturnStats,
} from "./logReturnStats";

const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;

describe("getLogReturnStats", () => {
  it("returns undefined for history with fewer than 2 points", () => {
    const history: History<number> = [{ timestamp: 0, value: 100 }];
    expect(getLogReturnStats(history)).toBeUndefined();
  });

  it("computes mean and sigma of log returns for consistent monthly returns", () => {
    const r = 1.05;
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 100 * r },
      { timestamp: 2 * msPerMonth, value: 100 * r * r },
      { timestamp: 3 * msPerMonth, value: 100 * r * r * r },
    ];

    const result = getLogReturnStats(history)!;

    expect(result.meanLogReturn).toBeCloseTo(Math.log(1.05), 10);
    expect(result.stdLogReturn).toBeCloseTo(0, 4);
    expect(result.stepsPerMonth).toBeCloseTo(1, 4);
  });

  it("computes mean and sigma for varying monthly returns", () => {
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 110 },
      { timestamp: 2 * msPerMonth, value: 99 },
      { timestamp: 3 * msPerMonth, value: 108.9 },
    ];

    const result = getLogReturnStats(history)!;

    expect(result.meanLogReturn).toBeDefined();
    expect(result.stdLogReturn).toBeGreaterThan(0);
    expect(result.stepsPerMonth).toBeCloseTo(1, 4);
  });

  it("handles quarterly time intervals correctly", () => {
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: 3 * msPerMonth, value: 115.76 },
      { timestamp: 6 * msPerMonth, value: 134 },
    ];

    const result = getLogReturnStats(history)!;

    expect(result.stepsPerMonth).toBeCloseTo(1 / 3, 4);
    expect(result.meanLogReturn).toBeCloseTo(Math.log(1.1576), 4);
  });

  it("handles descending timestamp order (as from price APIs)", () => {
    const history: History<number> = [
      { timestamp: 3 * msPerMonth, value: 100 * 1.05 * 1.05 * 1.05 },
      { timestamp: 2 * msPerMonth, value: 100 * 1.05 * 1.05 },
      { timestamp: msPerMonth, value: 100 * 1.05 },
      { timestamp: 0, value: 100 },
    ];

    const result = getLogReturnStats(history)!;

    expect(result.meanLogReturn).toBeCloseTo(Math.log(1.05), 10);
    expect(result.stdLogReturn).toBeCloseTo(0, 4);
    expect(result.stepsPerMonth).toBeCloseTo(1, 4);
  });
});

describe("getAssetReturnAndVolatility", () => {
  it("returns undefined for history with fewer than 2 points", () => {
    const history: History<number> = [{ timestamp: 0, value: 100 }];
    expect(getAssetReturnAndVolatility(history)).toBeUndefined();
  });

  it("computes annualized return for consistent monthly returns", () => {
    const r = 1.01;
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 100 * r },
      { timestamp: 2 * msPerMonth, value: 100 * r * r },
      { timestamp: 3 * msPerMonth, value: 100 * r * r * r },
    ];

    const result = getAssetReturnAndVolatility(history)!;

    const expectedAnnualizedReturn = 100 * (Math.exp(12 * Math.log(1.01)) - 1);
    expect(result.annualizedReturn).toBeCloseTo(expectedAnnualizedReturn, 4);
  });

  it("computes annualized volatility for varying monthly returns", () => {
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 110 },
      { timestamp: 2 * msPerMonth, value: 99 },
      { timestamp: 3 * msPerMonth, value: 108.9 },
    ];

    const result = getAssetReturnAndVolatility(history)!;

    expect(result.annualizedVolatility).toBeGreaterThan(0);
  });

  it("computes ratio as return divided by volatility", () => {
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 110 },
      { timestamp: 2 * msPerMonth, value: 99 },
      { timestamp: 3 * msPerMonth, value: 108.9 },
    ];

    const result = getAssetReturnAndVolatility(history)!;

    expect(result.ratio).toBeCloseTo(
      result.annualizedReturn / result.annualizedVolatility,
      10
    );
  });

  it("annualizes correctly: return × 12, volatility × √12", () => {
    const monthlyLogReturn = 0.02;
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 100 * Math.exp(monthlyLogReturn) },
    ];

    const result = getAssetReturnAndVolatility(history)!;

    expect(result.annualizedReturn).toBeCloseTo(
      100 * (Math.exp(12 * monthlyLogReturn) - 1),
      4
    );
    expect(result.annualizedVolatility).toBeCloseTo(0, 4);
  });

  it("handles quarterly intervals and annualizes from monthly-equivalent", () => {
    const history: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: 3 * msPerMonth, value: 115.76 },
      { timestamp: 6 * msPerMonth, value: 134 },
    ];

    const result = getAssetReturnAndVolatility(history)!;

    expect(result.annualizedReturn).toBeDefined();
    expect(result.annualizedVolatility).toBeGreaterThan(0);
  });

  it("returns near-zero volatility for perfectly consistent returns", () => {
    const r = 1.02;
    const history: History<number> = Array.from({ length: 13 }, (_, i) => ({
      timestamp: i * msPerMonth,
      value: 100 * r ** i,
    }));

    const result = getAssetReturnAndVolatility(history)!;

    expect(result.annualizedVolatility).toBeCloseTo(0, 4);
  });

  it("produces valid results for descending timestamp order (as from price APIs)", () => {
    const r = 1.01;
    const ascending: History<number> = [
      { timestamp: 0, value: 100 },
      { timestamp: msPerMonth, value: 100 * r },
      { timestamp: 2 * msPerMonth, value: 100 * r * r },
      { timestamp: 3 * msPerMonth, value: 100 * r * r * r },
    ];
    const descending = ascending.toReversed();

    const ascResult = getAssetReturnAndVolatility(ascending)!;
    const descResult = getAssetReturnAndVolatility(descending)!;

    expect(descResult.annualizedReturn).toBeCloseTo(
      ascResult.annualizedReturn,
      6
    );
    expect(descResult.annualizedVolatility).toBeCloseTo(
      ascResult.annualizedVolatility,
      6
    );
    expect(descResult.ratio).toBeCloseTo(ascResult.ratio, 4);
    expect(Number.isNaN(descResult.annualizedVolatility)).toBe(false);
  });
});

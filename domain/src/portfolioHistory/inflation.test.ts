import { describe, expect, it } from "vitest";
import { History } from "./history.entities";
import {
  deflateByIndex,
  generateConstantRateInflationIndex,
} from "./inflation";

describe("generateConstantRateInflationIndex", () => {
  it("produces a history starting at 1.0 for the start date", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2020-06-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result[0].timestamp).toBe(start);
    expect(result[0].value).toBeCloseTo(1, 10);
  });

  it("normalizes start date to the 1st of its month", () => {
    const start = new Date("2020-01-15").getTime();
    const end = new Date("2020-06-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result[0].timestamp).toBe(new Date("2020-01-01").getTime());
    expect(result[0].value).toBeCloseTo(1, 10);
    expect(result.length).toBe(6);
  });

  it("generates monthly steps with step-function interpolation", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2020-04-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it("grows exponentially at the given annual rate over one year", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2021-01-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    const lastValue = result[result.length - 1].value;
    expect(lastValue).toBeCloseTo(1.02, 2);
  });

  it("returns empty history when start equals end", () => {
    const t = new Date("2020-01-01").getTime();
    const result = generateConstantRateInflationIndex(t, t, 0.02);

    expect(result).toEqual([]);
  });

  it("returns empty history when start is after end", () => {
    const start = new Date("2020-06-01").getTime();
    const end = new Date("2020-01-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result).toEqual([]);
  });

  it("returns [1.0] for zero annual rate", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2021-01-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0);

    for (const point of result) {
      expect(point.value).toBeCloseTo(1, 10);
    }
  });

  it("uses step-function: later months have higher index values", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2020-03-01").getTime();
    const result = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result[0].value).toBeCloseTo(1, 10);
    expect(result[result.length - 1].value).toBeGreaterThan(result[0].value);
  });

  it("normalizes so first value is always 1.0 regardless of rate", () => {
    const start = new Date("2020-01-01").getTime();
    const end = new Date("2020-12-01").getTime();
    const result5 = generateConstantRateInflationIndex(start, end, 0.05);
    const result10 = generateConstantRateInflationIndex(start, end, 0.1);

    expect(result5[0].value).toBeCloseTo(1, 10);
    expect(result10[0].value).toBeCloseTo(1, 10);
    expect(result10[result10.length - 1].value).toBeGreaterThan(
      result5[result5.length - 1].value
    );
  });
});

describe("deflateByIndex", () => {
  it("returns empty history when market value history is empty", async () => {
    const inflationIndex = generateConstantRateInflationIndex(
      new Date("2020-01-01").getTime(),
      new Date("2021-01-01").getTime(),
      0.02
    );

    expect(deflateByIndex([], inflationIndex)).toEqual([]);
  });

  it("returns identical values when inflation index is all 1.0", async () => {
    const marketValueHistory: History<number> = [
      { timestamp: new Date("2020-01-01").getTime(), value: 1000 },
      { timestamp: new Date("2020-06-01").getTime(), value: 1100 },
      { timestamp: new Date("2021-01-01").getTime(), value: 1200 },
    ];
    const flatInflation: History<number> = [
      { timestamp: new Date("2020-01-01").getTime(), value: 1 },
      { timestamp: new Date("2020-06-01").getTime(), value: 1 },
      { timestamp: new Date("2021-01-01").getTime(), value: 1 },
    ];

    const result = deflateByIndex(marketValueHistory, flatInflation);

    expect(result[0].value).toBeCloseTo(1000, 10);
    expect(result[1].value).toBeCloseTo(1100, 10);
    expect(result[2].value).toBeCloseTo(1200, 10);
  });

  it("deflates values: later points are reduced more than earlier ones", async () => {
    const t0 = new Date("2020-01-01").getTime();
    const t1 = new Date("2021-01-01").getTime();

    const marketValueHistory: History<number> = [
      { timestamp: t0, value: 1000 },
      { timestamp: t1, value: 1000 },
    ];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result[0].value).toBeCloseTo(1000, 10);
    expect(result[1].value).toBeLessThan(1000);
  });

  it("hand-computed: 2% inflation over 1 year reduces constant value by ~1.96%", async () => {
    const t0 = new Date("2020-01-01").getTime();
    const t1 = new Date("2021-01-01").getTime();

    const marketValueHistory: History<number> = [
      { timestamp: t0, value: 1000 },
      { timestamp: t1, value: 1000 },
    ];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result[1].value).toBeCloseTo(1000 / 1.02, 1);
  });

  it("preserves timestamps from the market value history", async () => {
    const t0 = new Date("2020-01-01").getTime();
    const t1 = new Date("2021-01-01").getTime();

    const marketValueHistory: History<number> = [
      { timestamp: t0, value: 1000 },
      { timestamp: t1, value: 1100 },
    ];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result[0].timestamp).toBe(t0);
    expect(result[1].timestamp).toBe(t1);
  });

  it("uses step-function lookup for inflation index between months", async () => {
    const t0 = new Date("2020-01-01").getTime();
    const tMid = new Date("2020-01-15").getTime();
    const t1 = new Date("2020-02-01").getTime();

    const marketValueHistory: History<number> = [
      { timestamp: t0, value: 1000 },
      { timestamp: tMid, value: 1000 },
      { timestamp: t1, value: 1000 },
    ];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result[0].value).toBeCloseTo(result[1].value, 10);
  });

  it("single-point market value history returns single deflated point", async () => {
    const t0 = new Date("2020-01-01").getTime();
    const t1 = new Date("2021-01-01").getTime();

    const marketValueHistory: History<number> = [{ timestamp: t0, value: 500 }];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result.length).toBe(1);
    expect(result[0].value).toBeCloseTo(500, 10);
  });

  it("applies no deflation when market value timestamp is before inflation index start", async () => {
    const tBefore = new Date("2019-06-01").getTime();
    const t0 = new Date("2020-01-01").getTime();
    const t1 = new Date("2021-01-01").getTime();

    const marketValueHistory: History<number> = [
      { timestamp: tBefore, value: 1000 },
      { timestamp: t1, value: 1000 },
    ];
    const inflationIndex = generateConstantRateInflationIndex(t0, t1, 0.02);

    const result = deflateByIndex(marketValueHistory, inflationIndex);

    expect(result[0].value).toBeCloseTo(1000, 10);
    expect(result[1].value).toBeLessThan(1000);
  });
});

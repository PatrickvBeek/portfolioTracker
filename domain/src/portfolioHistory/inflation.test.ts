import { describe, expect, it } from "vitest";
import { History } from "./history.entities";
import {
  deflateByIndex,
  generateConstantRateInflationIndex,
  mergeWithConstantRateTail,
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

describe("mergeWithConstantRateTail", () => {
  const FEB = new Date("2020-02-01").getTime();
  const MAR = new Date("2020-03-01").getTime();
  const APR = new Date("2020-04-01").getTime();
  const MAY = new Date("2020-05-01").getTime();
  const JUN = new Date("2020-06-01").getTime();
  const JUL = new Date("2020-07-01").getTime();
  const JAN2021 = new Date("2021-01-01").getTime();

  it("returns empty when startDate >= endDate", () => {
    const t = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: t, value: 1 },
      { timestamp: FEB, value: 1.1 },
    ];

    expect(mergeWithConstantRateTail(real, t, t, 0.02)).toEqual([]);
    expect(mergeWithConstantRateTail(real, t + 1, t, 0.02)).toEqual([]);
  });

  it("falls back to constant-rate index when real index is empty", () => {
    const start = new Date("2020-01-01").getTime();
    const end = JAN2021;

    const result = mergeWithConstantRateTail([], start, end, 0.02);
    const expected = generateConstantRateInflationIndex(start, end, 0.02);

    expect(result).toEqual(expected);
  });

  it("returns real points as-is when real covers the whole range", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: start, value: 1 },
      { timestamp: FEB, value: 1.1 },
      { timestamp: MAR, value: 1.2 },
      { timestamp: APR, value: 1.3 },
    ];

    const result = mergeWithConstantRateTail(real, start, APR, 0.02);

    expect(result.map((p) => p.timestamp)).toEqual([start, FEB, MAR, APR]);
    expect(result.map((p) => p.value)).toEqual([1, 1.1, 1.2, 1.3]);
  });

  it("is robust to unsorted real input", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: MAR, value: 1.2 },
      { timestamp: start, value: 1 },
      { timestamp: FEB, value: 1.1 },
      { timestamp: APR, value: 1.3 },
    ];

    const result = mergeWithConstantRateTail(real, start, APR, 0.02);

    expect(result.map((p) => p.timestamp)).toEqual([start, FEB, MAR, APR]);
    expect(result.map((p) => p.value)).toEqual([1, 1.1, 1.2, 1.3]);
  });

  it("forward-fills internal gaps from the last known real value", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: start, value: 1 },
      { timestamp: APR, value: 1.3 },
    ];

    const result = mergeWithConstantRateTail(real, start, APR, 0.02);

    expect(result.map((p) => p.timestamp)).toEqual([start, FEB, MAR, APR]);
    expect(result[0].value).toBe(1);
    expect(result[1].value).toBe(1);
    expect(result[2].value).toBe(1);
    expect(result[3].value).toBe(1.3);
  });

  it("compounds a tail anchored to the last real value when real is shorter than range", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: start, value: 1 },
      { timestamp: FEB, value: 1.1 },
      { timestamp: MAR, value: 1.2 },
    ];
    const end = JAN2021;

    const result = mergeWithConstantRateTail(real, start, end, 0.02);

    const lastRealIdx = result.findIndex((p) => p.timestamp === MAR);
    expect(lastRealIdx).toBe(2);
    expect(result[lastRealIdx].value).toBe(1.2);

    const tail = result.slice(lastRealIdx + 1);
    expect(tail.length).toBeGreaterThan(0);

    for (const point of tail) {
      expect(point.value).toBeGreaterThan(1.2);
    }

    const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;
    const expectedFirstTail = 1.2 * Math.pow(1.02, (APR - MAR) / MS_PER_YEAR);
    expect(tail[0].value).toBeCloseTo(expectedFirstTail, 10);
    expect(tail[tail.length - 1].timestamp).toBe(end);
  });

  it("tail continues from the last real value without resetting to 1.0", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: start, value: 1 },
      { timestamp: FEB, value: 1.1 },
      { timestamp: MAR, value: 1.2 },
    ];
    const end = APR;

    const result = mergeWithConstantRateTail(real, start, end, 0.02);

    const lastRealIdx = result.findIndex((p) => p.timestamp === MAR);
    expect(result[lastRealIdx].value).toBe(1.2);
    expect(result[lastRealIdx + 1].value).toBeGreaterThan(1.2);
    expect(result[lastRealIdx + 1].value).toBeLessThan(1.2 * 1.02);
    expect(result[lastRealIdx + 1].value).not.toBeCloseTo(1, 5);
  });

  it("falls back to constant-rate index when startDate is after the last real point", () => {
    const realEnd = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: realEnd, value: 1 },
      { timestamp: FEB, value: 2 },
    ];
    const start = MAR;
    const end = JUL;

    const result = mergeWithConstantRateTail(real, start, end, 0.02);

    const expected = generateConstantRateInflationIndex(start, end, 0.02);
    expect(result).toEqual(expected);
    expect(result[0].value).toBeCloseTo(1, 10);
    expect(result[result.length - 1].timestamp).toBe(JUL);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].value).toBeGreaterThan(result[i - 1].value);
    }
  });

  it("emits monthly first-of-month points across the full range", () => {
    const start = new Date("2020-01-15").getTime();
    const real: History<number> = [
      { timestamp: FEB, value: 1.1 },
      { timestamp: APR, value: 1.3 },
    ];
    const end = JUN;

    const result = mergeWithConstantRateTail(real, start, end, 0.02);

    const expectedTimestamps = [
      new Date("2020-01-01").getTime(),
      FEB,
      MAR,
      APR,
      MAY,
      JUN,
    ];
    expect(result.map((p) => p.timestamp)).toEqual(expectedTimestamps);
  });

  it("composes with deflateByIndex without error", () => {
    const start = new Date("2020-01-01").getTime();
    const real: History<number> = [
      { timestamp: start, value: 1 },
      { timestamp: FEB, value: 1.1 },
    ];
    const end = APR;

    const index = mergeWithConstantRateTail(real, start, end, 0.02);
    const marketValueHistory: History<number> = [
      { timestamp: start, value: 1000 },
      { timestamp: APR, value: 1100 },
    ];

    const deflated = deflateByIndex(marketValueHistory, index);

    expect(deflated.length).toBe(2);
    expect(deflated[0].value).toBeCloseTo(1000, 10);
    expect(deflated[1].value).toBeLessThan(1100);
  });
});

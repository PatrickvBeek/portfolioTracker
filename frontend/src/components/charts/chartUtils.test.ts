import { vi } from "vitest";
import { CHART_RANGE_DAYS } from "./chartRange.types";
import {
  calculateGradientOffset,
  formatAxisValue,
  getAxisUnit,
  getCurrencyAxisProps,
  getDefaultTimeAxis,
} from "./chartUtils";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const TODAY = "2020-03-05";
vi.setSystemTime(TODAY);

const todayMs = new Date(TODAY).getTime();

describe("getDefaultTimeAxis", () => {
  const xMin = todayMs - 100 * DAY_IN_MS;

  it("uses daily step for 1M range", () => {
    const axis = getDefaultTimeAxis(xMin, "1M");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.every((s) => s === DAY_IN_MS)).toBe(true);
  });

  it("uses daily step for 3M range", () => {
    const axis = getDefaultTimeAxis(xMin, "3M");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.every((s) => s === DAY_IN_MS)).toBe(true);
  });

  it("uses daily step for 1Y range", () => {
    const axis = getDefaultTimeAxis(xMin, "1Y");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.every((s) => s === DAY_IN_MS)).toBe(true);
  });

  it("uses weekly step for 3Y range", () => {
    const oldXMin = todayMs - 1200 * DAY_IN_MS;
    const axis = getDefaultTimeAxis(oldXMin, "3Y");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.slice(0, -1).every((s) => s === 7 * DAY_IN_MS)).toBe(true);
  });

  it("uses weekly step for 10Y range", () => {
    const oldXMin = todayMs - 4000 * DAY_IN_MS;
    const axis = getDefaultTimeAxis(oldXMin, "10Y");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.slice(0, -1).every((s) => s === 7 * DAY_IN_MS)).toBe(true);
  });

  it("clamps start to rangeStart when rangeStart > xMin", () => {
    const axis = getDefaultTimeAxis(xMin, "1M");
    const rangeStart = todayMs - CHART_RANGE_DAYS["1M"]! * DAY_IN_MS;
    expect(axis[0]).toBe(rangeStart);
  });

  it("uses xMin as start when xMin > rangeStart", () => {
    const recentXMin = todayMs - 5 * DAY_IN_MS;
    const axis = getDefaultTimeAxis(recentXMin, "1Y");
    expect(axis[0]).toBe(recentXMin);
  });

  it("Max uses daily step when span <= 365 days", () => {
    const recentXMin = todayMs - 200 * DAY_IN_MS;
    const axis = getDefaultTimeAxis(recentXMin, "Max");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.every((s) => s === DAY_IN_MS)).toBe(true);
  });

  it("Max uses weekly step when span > 365 days", () => {
    const oldXMin = todayMs - 400 * DAY_IN_MS;
    const axis = getDefaultTimeAxis(oldXMin, "Max");
    const steps = axis.slice(1).map((t, i) => t - axis[i]);
    expect(steps.slice(0, -1).every((s) => s === 7 * DAY_IN_MS)).toBe(true);
  });

  it("always ends with Date.now()", () => {
    const axis = getDefaultTimeAxis(xMin, "1M");
    expect(axis[axis.length - 1]).toBe(todayMs);
  });

  it("returns no duplicate timestamps", () => {
    const axis = getDefaultTimeAxis(xMin, "1M");
    expect(new Set(axis).size).toBe(axis.length);
  });
});

describe("calculateGradientOffset", () => {
  it("returns 1 when all values are above zero", () => {
    const data = [{ v: 10 }, { v: 20 }, { v: 30 }];
    expect(calculateGradientOffset(data, "v")).toBe(1);
  });

  it("returns 0 when all values are below zero", () => {
    const data = [{ v: -10 }, { v: -20 }, { v: -30 }];
    expect(calculateGradientOffset(data, "v")).toBe(0);
  });

  it("computes zero-crossing offset for mixed values", () => {
    const data = [{ v: -50 }, { v: 50 }];
    expect(calculateGradientOffset(data, "v")).toBeCloseTo(0.5);
  });

  it("returns 1 when all values are above baseline", () => {
    const data = [{ v: 10 }, { v: 20 }, { v: 30 }];
    expect(calculateGradientOffset(data, "v", { baseline: 5 })).toBe(1);
  });

  it("returns 0 when all values are below baseline", () => {
    const data = [{ v: 10 }, { v: 20 }, { v: 30 }];
    expect(calculateGradientOffset(data, "v", { baseline: 40 })).toBe(0);
  });

  it("computes baseline-crossing offset for values spanning baseline", () => {
    const data = [{ v: 100 }, { v: 200 }, { v: 300 }];
    expect(calculateGradientOffset(data, "v", { baseline: 200 })).toBeCloseTo(
      1 / 2
    );
  });

  it("treats values equal to baseline as above", () => {
    const data = [{ v: 100 }, { v: 200 }, { v: 300 }];
    expect(calculateGradientOffset(data, "v", { baseline: 100 })).toBe(1);
  });

  it("defaults baseline to 0 for backward compatibility", () => {
    const data = [{ v: -10 }, { v: 10 }];
    expect(calculateGradientOffset(data, "v")).toEqual(
      calculateGradientOffset(data, "v", { baseline: 0 })
    );
  });
});

describe("getAxisUnit", () => {
  it("uses euros for small magnitudes", () => {
    expect(getAxisUnit(0)).toEqual({ divisor: 1, suffix: "€" });
    expect(getAxisUnit(9_999)).toEqual({ divisor: 1, suffix: "€" });
  });

  it("uses thousands from 10,000", () => {
    expect(getAxisUnit(10_000)).toEqual({ divisor: 1_000, suffix: "k€" });
    expect(getAxisUnit(999_999)).toEqual({ divisor: 1_000, suffix: "k€" });
  });

  it("uses millions from 1,000,000", () => {
    expect(getAxisUnit(1_000_000)).toEqual({
      divisor: 1_000_000,
      suffix: "M€",
    });
  });

  it("uses the magnitude for negative values", () => {
    expect(getAxisUnit(-1_500_000)).toEqual({
      divisor: 1_000_000,
      suffix: "M€",
    });
  });
});

describe("formatAxisValue", () => {
  it("formats euros", () => {
    expect(formatAxisValue(1_500, getAxisUnit(1_500), "en-US")).toBe("1,500 €");
  });

  it("formats thousands", () => {
    expect(formatAxisValue(15_000, getAxisUnit(15_000), "en-US")).toBe("15 k€");
  });

  it("formats millions with one decimal", () => {
    expect(formatAxisValue(1_250_000, getAxisUnit(1_250_000), "en-US")).toBe(
      "1.3 M€"
    );
  });

  it("formats negative values", () => {
    expect(formatAxisValue(-2_500, getAxisUnit(-2_500), "en-US")).toBe(
      "-2,500 €"
    );
  });
});

describe("getCurrencyAxisProps", () => {
  it("uses euro ticks for small magnitudes", () => {
    const props = getCurrencyAxisProps([{ timestamp: 0, value: 1_500 }]);
    expect(props.tickFormatter?.(1_500, 0)).toMatch(/ €$/);
  });

  it("uses thousands for mid magnitudes", () => {
    const props = getCurrencyAxisProps([{ timestamp: 0, value: 50_000 }]);
    expect(props.tickFormatter?.(50_000, 0)).toMatch(/ k€$/);
  });

  it("uses millions for large magnitudes", () => {
    const props = getCurrencyAxisProps([{ timestamp: 0, value: 2_000_000 }]);
    expect(props.tickFormatter?.(2_000_000, 0)).toMatch(/ M€$/);
  });

  it("does not throw for empty data", () => {
    expect(() => getCurrencyAxisProps([])).not.toThrow();
    expect(getCurrencyAxisProps([]).tickFormatter?.(0, 0)).toMatch(/ €$/);
  });
});

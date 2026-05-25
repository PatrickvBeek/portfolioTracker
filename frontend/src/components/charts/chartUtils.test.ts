import { vi } from "vitest";
import { CHART_RANGE_DAYS } from "./chartRange.types";
import { getDefaultTimeAxis } from "./chartUtils";

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

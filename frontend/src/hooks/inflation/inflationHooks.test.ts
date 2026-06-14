import { generateConstantRateInflationIndex } from "pt-domain";
import { vi } from "vitest";
import { customRenderHook } from "../../testUtils/componentHelpers";
import { useInflationIndex } from "./inflationHooks";

vi.setSystemTime("2000-07-01");

describe("useInflationIndex", () => {
  it("returns an inflation index starting from the given start date to now", () => {
    const startDate = new Date("1998-01-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    const index = result.current;
    expect(index.length).toBeGreaterThan(0);
    expect(index[0].timestamp).toBe(startDate);
    expect(index[0].value).toBeCloseTo(1, 10);
  });

  it("uses 2% annual rate as the fallback", () => {
    const startDate = new Date("1999-07-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    const expected = generateConstantRateInflationIndex(
      startDate,
      new Date("2000-07-01").getTime(),
      0.02
    );

    expect(result.current).toEqual(expected);
  });

  it("returns empty array for undefined start date", () => {
    const { result } = customRenderHook(() => useInflationIndex(undefined));

    expect(result.current).toEqual([]);
  });

  it("returns index ending at or before current time", () => {
    const startDate = new Date("1995-01-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    const lastIndex = result.current[result.current.length - 1];
    expect(lastIndex.timestamp).toBeLessThanOrEqual(Date.now());
  });
});

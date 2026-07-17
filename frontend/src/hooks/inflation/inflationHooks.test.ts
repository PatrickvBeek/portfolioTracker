import { generateConstantRateInflationIndex } from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../testUtils/componentHelpers";
import {
  getDestatisResponse,
  mockNetwork,
  type DestatisCpiFixtures,
} from "../../testUtils/networkMock";
import { useInflationIndex } from "./inflationHooks";

vi.setSystemTime("2000-07-01");

const NOW = new Date("2000-07-01").getTime();

const buildCpiFixtures = (
  startYear: number,
  endYear: number
): DestatisCpiFixtures => {
  const fixtures: DestatisCpiFixtures = {};
  let level = 100;
  for (let year = startYear; year <= endYear; year++) {
    fixtures[year] = {};
    for (let month = 1; month <= 12; month++) {
      fixtures[year][month] = level;
      level += 0.3;
    }
  }
  return fixtures;
};

describe("useInflationIndex", () => {
  const { setBackendData } = mockNetwork({ prices: {} });

  afterEach(() => {
    setBackendData({ prices: {} });
  });

  it("returns empty array for undefined start date", () => {
    const { result } = customRenderHook(() => useInflationIndex(undefined));

    expect(result.current.data).toEqual([]);
  });

  it("merges real CPI data with a constant-rate tail on successful fetch", async () => {
    setBackendData({
      prices: {},
      destatis: getDestatisResponse(buildCpiFixtures(1995, 1999)),
    });

    const startDate = new Date("1995-01-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    await customWaitFor(() =>
      expect(result.current.data!.length).toBeGreaterThan(0)
    );

    const index = result.current.data!;

    expect(index[0].timestamp).toBe(new Date("1995-01-01").getTime());
    expect(index[0].value).toBeCloseTo(1, 10);

    const lastIndex = index[index.length - 1];
    expect(lastIndex.timestamp).toBeLessThanOrEqual(NOW);

    const lastRealTimestamp = new Date("1999-12-01").getTime();
    const lastRealIdx = index.findIndex(
      (p) => p.timestamp === lastRealTimestamp
    );
    expect(lastRealIdx).toBeGreaterThan(-1);
    expect(lastRealIdx + 1).toBeLessThan(index.length);

    const lastRealValue = index[lastRealIdx].value;
    const firstTailValue = index[lastRealIdx + 1].value;
    expect(firstTailValue).toBeGreaterThan(lastRealValue);
    expect(firstTailValue).toBeLessThan(lastRealValue * 1.02);
    expect(firstTailValue).not.toBeCloseTo(1, 5);
  });

  it("falls back to a full-range 2% constant-rate index when the fetch fails", async () => {
    setBackendData({ prices: {}, destatis: null });

    const startDate = new Date("1998-01-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    const expected = generateConstantRateInflationIndex(startDate, NOW, 0.02);

    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(expected);
    expect(result.current.data![0].value).toBeCloseTo(1, 10);
  });

  it("returns a fallback index while the fetch is still loading", () => {
    setBackendData({
      prices: {},
      destatis: getDestatisResponse(buildCpiFixtures(1995, 1999)),
    });

    const startDate = new Date("1999-07-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    const expected = generateConstantRateInflationIndex(startDate, NOW, 0.02);
    expect(result.current.data).toEqual(expected);
  });

  it("returns an index ending at or before the current time", async () => {
    setBackendData({
      prices: {},
      destatis: getDestatisResponse(buildCpiFixtures(1995, 1999)),
    });

    const startDate = new Date("1995-01-01").getTime();
    const { result } = customRenderHook(() => useInflationIndex(startDate));

    await customWaitFor(() =>
      expect(result.current.data!.length).toBeGreaterThan(0)
    );

    const lastIndex = result.current.data![result.current.data!.length - 1];
    expect(lastIndex.timestamp).toBeLessThanOrEqual(NOW);
  });
});

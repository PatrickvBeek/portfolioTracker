import {
  deriveMonthlyContribution,
  getForecastYAxisProps,
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

const point = (
  median: number,
  uncertaintyBand: [number, number],
  cashFlow = 0
) => ({ timestamp: 0, median, uncertaintyBand, cashFlow });

describe("getForecastYAxisProps", () => {
  it("ignores the upper band for the domain", () => {
    const props = getForecastYAxisProps([point(200, [100, 5_000])]);
    expect(props.domain?.[1]).toBeCloseTo(220);
    expect(props.domain?.[1]).toBeLessThan(5_000);
  });

  it("ignores hidden cash flow for the domain", () => {
    const props = getForecastYAxisProps([point(200, [100, 300], 1_000_000)]);
    const defaultProps = getForecastYAxisProps([point(200, [100, 300])]);

    expect(props.domain).toEqual(defaultProps.domain);
    expect(props.domain?.[1]).toBeCloseTo(220);
  });

  it("includes cash flow in the domain when requested", () => {
    const props = getForecastYAxisProps([point(200, [100, 300], 1_000_000)], {
      includeCashFlow: true,
    });

    expect(props.domain?.[1]).toBeCloseTo(1_100_000);
  });

  it("uses the median and lower band for bottom and top", () => {
    const props = getForecastYAxisProps([point(50, [-200, 5_000])]);
    expect(props.domain?.[0]).toBeCloseTo(-220);
    expect(props.domain?.[1]).toBeCloseTo(55);
  });

  it("produces ticks inside the domain", () => {
    const props = getForecastYAxisProps([point(200, [100, 5_000])]);
    const [bottom, top] = props.domain ?? [0, 0];
    expect(props.ticks?.length).toBeGreaterThan(0);
    expect(props.ticks?.every((tick) => tick >= bottom && tick <= top)).toBe(
      true
    );
  });

  it("returns [0, 1] for all-zero data", () => {
    expect(getForecastYAxisProps([point(0, [0, 0])]).domain).toEqual([0, 1]);
  });

  it("returns [0, 1] for empty data", () => {
    expect(() => getForecastYAxisProps([])).not.toThrow();
    expect(getForecastYAxisProps([]).domain).toEqual([0, 1]);
  });

  it("changes the unit at the thresholds", () => {
    const euros = getForecastYAxisProps([point(1_500, [1_000, 2_000])]);
    const thousands = getForecastYAxisProps([point(10_000, [9_000, 12_000])]);
    const millions = getForecastYAxisProps([
      point(1_000_000, [900_000, 1_200_000]),
    ]);

    expect(euros.tickFormatter?.(1_500)).toBe("1,500 €");
    expect(thousands.tickFormatter?.(11_000)).toBe("11 k€");
    expect(millions.tickFormatter?.(1_100_000)).toBe("1.1 M€");
  });
});

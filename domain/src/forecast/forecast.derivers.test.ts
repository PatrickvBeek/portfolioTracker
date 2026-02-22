import { describe, expect, it } from "vitest";
import { History } from "../portfolioHistory/history.entities";
import {
  applyInflationDiscount,
  getGeometricBrownianMotionParams,
  runGeometricBrownianMotionForecast,
} from "./forecast.derivers";
import { ForecastInput } from "./forecast.entities";

const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;

describe("forecasting.derivers", () => {
  describe("runGeometricBrownianMotionForecast", () => {
    it("should run forecast and return proper structure", () => {
      const input: ForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        months: 3,
        monthlyInvestment: 2500,
        startingValue: 0,
        simulationCount: 100,
      };
      const result = runGeometricBrownianMotionForecast(input);

      expect(result.median).toHaveLength(3);
      expect(result.mean).toHaveLength(3);
      expect(result.confidenceLow).toHaveLength(3);
      expect(result.confidenceHigh).toHaveLength(3);
      expect(result.cashFlows).toEqual([2500, 5000, 7500]);
    });

    it("should handle single month forecast", () => {
      const input: ForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        months: 1,
        monthlyInvestment: 2500,
        startingValue: 0,
        simulationCount: 50,
      };
      const result = runGeometricBrownianMotionForecast(input);

      expect(result.cashFlows).toEqual([2500]);
    });

    it("should produce portfolio values that increase with positive returns on average", () => {
      const input: ForecastInput = {
        mu: 0.05,
        sigma: 0.1,
        months: 6,
        monthlyInvestment: 1000,
        startingValue: 0,
        simulationCount: 500,
      };
      const result = runGeometricBrownianMotionForecast(input);

      const month1Mean = result.mean[0];
      const month6Mean = result.mean[5];

      expect(month6Mean).toBeGreaterThan(month1Mean);
      expect(month6Mean).toBeGreaterThan(6000);
    });

    it("test against reference implementation example", () => {
      const N_months = 120;

      const input: ForecastInput = {
        mu: 0.007,
        sigma: 0.044,
        months: N_months,
        monthlyInvestment: 100,
        startingValue: 0,
        simulationCount: 2000,
      };

      const { mean, median, confidenceHigh, confidenceLow } =
        runGeometricBrownianMotionForecast(input);

      expect(mean.at(N_months - 1)).toBeCloseTo(20000, -3);
      expect(median.at(N_months - 1)).toBeCloseTo(19000, -3);
      expect(confidenceLow.at(N_months - 1)).toBeCloseTo(11700, -3);
      expect(confidenceHigh.at(N_months - 1)).toBeCloseTo(32000, -3.5);
    });
  });

  describe("getGeometricBrownianMotionParams", () => {
    it("should calculate mu and sigma from history data", () => {
      // Create sample history data with known returns using realistic monthly timestamps
      const msPerMonth = 1000 * 60 * 60 * 24 * 30.44; // Average days per month
      const twrHistory: History<number> = [
        { timestamp: 0, value: 100 },
        { timestamp: msPerMonth, value: 105 }, // 5% return after 1 month
        { timestamp: 2 * msPerMonth, value: 110.25 }, // 5% return after 2 months
        { timestamp: 3 * msPerMonth, value: 115.76 }, // 5% return after 3 months
      ];

      const { mu, sigma } = getGeometricBrownianMotionParams(twrHistory)!;

      // For consistent 5% monthly returns, mu should be log(1.05)
      const expectedMu = Math.log(1.05);
      expect(mu).toBeCloseTo(expectedMu, 4);

      // With consistent returns, sigma should be close to 0
      expect(sigma).toBeCloseTo(0, 4);
    });

    it("should handle varying returns", () => {
      const twrHistory: History<number> = [
        { timestamp: 0, value: 100 },
        { timestamp: msPerMonth, value: 110 }, // 10% return
        { timestamp: 2 * msPerMonth, value: 99 }, // -10% return
        { timestamp: 3 * msPerMonth, value: 108.9 }, // 10% return
      ];

      const { mu, sigma } = getGeometricBrownianMotionParams(twrHistory)!;

      // Should calculate mean and standard deviation of log returns
      expect(mu).toBeDefined();
      expect(sigma).toBeDefined();
      expect(sigma).toBeGreaterThan(0);
    });

    it("should return undefined with insufficient data", () => {
      const twrHistory: History<number> = [{ timestamp: 0, value: 100 }];

      const result = getGeometricBrownianMotionParams(twrHistory);
      expect(result).toBeUndefined();
    });

    it("should handle different time intervals correctly", () => {
      const quarterlyHistory: History<number> = [
        { timestamp: 0, value: 100 },
        { timestamp: 3 * msPerMonth, value: 105 },
        { timestamp: 6 * msPerMonth, value: 110.25 },
        { timestamp: 9 * msPerMonth, value: 115.76 },
      ];

      const { mu, sigma } = getGeometricBrownianMotionParams(quarterlyHistory)!;

      const expectedMonthlyMu = Math.log(1.05) / 3;
      expect(mu).toBeCloseTo(expectedMonthlyMu, 3);

      expect(sigma).toBeCloseTo(0, 3);
    });
  });

  describe("applyInflationDiscount", () => {
    it("should return unchanged result when inflation rate is 0", () => {
      const result = {
        median: [1000, 2000, 3000],
        mean: [1100, 2100, 3100],
        confidenceLow: [800, 1800, 2800],
        confidenceHigh: [1400, 2400, 3400],
        cashFlows: [100, 200, 300],
      };

      const discounted = applyInflationDiscount(result, 0);

      expect(discounted).toEqual(result);
    });

    it("should correctly discount values at 2% inflation over 12 months", () => {
      const result = {
        median: [6000, 6500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10000],
        mean: [6000, 6500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10000],
        confidenceLow: [6000, 6500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10000],
        confidenceHigh: [6000, 6500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10000],
        cashFlows: [6000, 6500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10000],
      };

      const discounted = applyInflationDiscount(result, 0.02);

      expect(discounted.median[1]).toBeCloseTo(
        6500 / Math.pow(1.02, 2 / 12),
        1
      );
      expect(discounted.median[11]).toBeCloseTo(10000 / 1.02, 1);
    });

    it("should correctly discount values at 3% inflation over 120 months (10 years)", () => {
      const result = {
        median: Array(119).fill(0).concat([100000]),
        mean: Array(119).fill(0).concat([100000]),
        confidenceLow: Array(119).fill(0).concat([100000]),
        confidenceHigh: Array(119).fill(0).concat([100000]),
        cashFlows: Array(119).fill(0).concat([100000]),
      };

      const discounted = applyInflationDiscount(result, 0.03);

      expect(discounted.median[119]).toBeCloseTo(
        100000 / Math.pow(1.03, 10),
        0
      );
    });

    it("should discount all five arrays: median, mean, confidenceLow, confidenceHigh, cashFlows", () => {
      const result = {
        median: [1000, 2000],
        mean: [1100, 2100],
        confidenceLow: [800, 1800],
        confidenceHigh: [1400, 2400],
        cashFlows: [100, 200],
      };

      const discounted = applyInflationDiscount(result, 0.05);

      const expectedMedian0 = 1000 / Math.pow(1.05, 1 / 12);
      const expectedMedian1 = 2000 / Math.pow(1.05, 2 / 12);

      expect(discounted.median[0]).toBeCloseTo(expectedMedian0, 1);
      expect(discounted.median[1]).toBeCloseTo(expectedMedian1, 1);
      expect(discounted.mean[0]).toBeCloseTo(1100 / Math.pow(1.05, 1 / 12), 1);
      expect(discounted.confidenceLow[1]).toBeCloseTo(
        1800 / Math.pow(1.05, 2 / 12),
        1
      );
      expect(discounted.confidenceHigh[0]).toBeCloseTo(
        1400 / Math.pow(1.05, 1 / 12),
        1
      );
      expect(discounted.cashFlows[1]).toBeCloseTo(
        200 / Math.pow(1.05, 2 / 12),
        1
      );
    });

    it("should handle decimal inflation rates (e.g., 2.5%)", () => {
      const result = {
        median: [1000],
        mean: [1000],
        confidenceLow: [1000],
        confidenceHigh: [1000],
        cashFlows: [100],
      };

      const discounted = applyInflationDiscount(result, 0.025);

      expect(discounted.median[0]).toBeCloseTo(
        1000 / Math.pow(1.025, 1 / 12),
        1
      );
    });
  });
});

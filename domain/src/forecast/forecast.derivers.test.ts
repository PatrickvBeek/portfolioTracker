import { describe, expect, it } from "vitest";
import { runGeometricBrownianMotionForecast } from "./forecast.derivers";
import { ForecastInput } from "./forecast.entities";

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
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  runGeometricBrownianMotionForecast,
  runWithdrawalForecast,
} from "./forecast.derivers";
import { WithdrawalForecastInput } from "./forecast.entities";

const shockSequence: number[] = [];
let callIndex = 0;

vi.mock("@stdlib/random/base/normal", () => ({
  default: () => {
    if (shockSequence.length === 0) {
      return 0;
    }
    const value = shockSequence[callIndex % shockSequence.length];
    callIndex++;
    return value;
  },
}));

const useShocks = (values: number[]) => {
  shockSequence.length = 0;
  shockSequence.push(...values);
  callIndex = 0;
};

beforeEach(() => {
  useShocks([]);
});

describe("runWithdrawalForecast", () => {
  describe("structure and shape", () => {
    it("returns a result with ruinProbability and full forecast arrays", () => {
      useShocks([0.01, -0.02, 0.005, 0.02]);

      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 100000,
        simulationCount: 50,
        accumulationMonths: 12,
        decumulationMonths: 24,
        monthlyContribution: 500,
        monthlyWithdrawal: 2000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      const totalMonths = input.accumulationMonths + input.decumulationMonths;
      expect(result.median).toHaveLength(totalMonths);
      expect(result.confidenceLow).toHaveLength(totalMonths);
      expect(result.confidenceHigh).toHaveLength(totalMonths);
      expect(result.cashFlows).toHaveLength(totalMonths);
      expect(result.ruinProbability).toBeGreaterThanOrEqual(0);
      expect(result.ruinProbability).toBeLessThanOrEqual(1);
    });
  });

  describe("ruin probability under the strict ruin rule", () => {
    it("reports ruinProbability = 1 when starting value cannot cover the first withdrawal", () => {
      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 0,
        simulationCount: 100,
        accumulationMonths: 0,
        decumulationMonths: 12,
        monthlyContribution: 0,
        monthlyWithdrawal: 1000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.ruinProbability).toBe(1);
      expect(result.median.every((v) => v === 0)).toBe(true);
    });

    it("reports ruinProbability = 0 when the balance always covers the withdrawal", () => {
      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 10_000_000,
        simulationCount: 100,
        accumulationMonths: 0,
        decumulationMonths: 12,
        monthlyContribution: 0,
        monthlyWithdrawal: 100,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.ruinProbability).toBe(0);
    });

    it("records zero balances for all remaining months after ruin (comparable paths)", () => {
      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 0,
        simulationCount: 10,
        accumulationMonths: 0,
        decumulationMonths: 6,
        monthlyContribution: 0,
        monthlyWithdrawal: 1000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.median).toEqual([0, 0, 0, 0, 0, 0]);
      expect(result.confidenceLow).toEqual([0, 0, 0, 0, 0, 0]);
      expect(result.confidenceHigh).toEqual([0, 0, 0, 0, 0, 0]);
    });
  });

  describe("withdrawal boundaries", () => {
    it("does not report ruin when the balance equals the withdrawal", () => {
      useShocks([0]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 0,
        decumulationMonths: 1,
        monthlyContribution: 0,
        monthlyWithdrawal: 1000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.median).toEqual([0]);
      expect(result.ruinProbability).toBe(0);
    });

    it("keeps the balance flat when the withdrawal is zero", () => {
      useShocks([0]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 0,
        decumulationMonths: 3,
        monthlyContribution: 0,
        monthlyWithdrawal: 0,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.median).toEqual([1000, 1000, 1000]);
      expect(result.ruinProbability).toBe(0);
    });
  });

  describe("net cash flows", () => {
    it("accumulates contributions positively then withdrawals negatively", () => {
      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 100000,
        simulationCount: 50,
        accumulationMonths: 2,
        decumulationMonths: 2,
        monthlyContribution: 1000,
        monthlyWithdrawal: 500,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.cashFlows).toEqual([1000, 2000, 1500, 1000]);
    });

    it("applies inflation escalation to withdrawals in the cash flow series", () => {
      const input: WithdrawalForecastInput = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 100000,
        simulationCount: 50,
        accumulationMonths: 0,
        decumulationMonths: 2,
        monthlyContribution: 0,
        monthlyWithdrawal: 1000,
        annualInflationRate: 0.24,
      };

      const result = runWithdrawalForecast(input);

      const firstWithdrawal = 1000 * Math.pow(1.24, 1 / 12);
      const secondWithdrawal = 1000 * Math.pow(1.24, 2 / 12);
      expect(result.cashFlows[0]).toBeCloseTo(-firstWithdrawal, 6);
      expect(result.cashFlows[1]).toBeCloseTo(
        -(firstWithdrawal + secondWithdrawal),
        5
      );
    });
  });

  describe("real-terms withdrawals", () => {
    it("keeps the purchasing power of the entered withdrawal through the build-up and retirement phases", () => {
      useShocks([0]);

      const annualInflationRate = 0.12;
      const monthlyWithdrawal = 1000;
      const accumulationMonths = 12;
      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 100000,
        simulationCount: 1,
        accumulationMonths,
        decumulationMonths: 2,
        monthlyContribution: 0,
        monthlyWithdrawal,
        annualInflationRate,
      };

      const result = runWithdrawalForecast(input);

      const nominalWithdrawalAt = (monthIndex: number) =>
        monthlyWithdrawal *
        Math.pow(1 + annualInflationRate, (monthIndex + 1) / 12);
      const firstWithdrawal = nominalWithdrawalAt(accumulationMonths);
      const secondWithdrawal = nominalWithdrawalAt(accumulationMonths + 1);

      expect(result.cashFlows[accumulationMonths]).toBeCloseTo(
        -firstWithdrawal,
        6
      );
      expect(result.cashFlows[accumulationMonths + 1]).toBeCloseTo(
        -(firstWithdrawal + secondWithdrawal),
        6
      );
      expect(result.median[accumulationMonths - 1]).toBeCloseTo(100000, 6);
      expect(result.median[accumulationMonths]).toBeCloseTo(
        100000 - firstWithdrawal,
        6
      );
      expect(result.median[accumulationMonths + 1]).toBeCloseTo(
        100000 - firstWithdrawal - secondWithdrawal,
        6
      );

      const nominalFlows = result.cashFlows.map(
        (value, index) => value - (result.cashFlows[index - 1] ?? 0)
      );
      const realFlows = nominalFlows.map(
        (value, index) =>
          value / Math.pow(1 + annualInflationRate, (index + 1) / 12)
      );

      expect(realFlows[accumulationMonths]).toBeCloseTo(-monthlyWithdrawal, 6);
      expect(realFlows[accumulationMonths + 1]).toBeCloseTo(
        -monthlyWithdrawal,
        6
      );
    });
  });

  describe("degenerate case (no decumulation) coincides with an accumulation forecast", () => {
    it("produces the same median as runGeometricBrownianMotionForecast with matching contributions", () => {
      const shared = {
        mu: 0.01,
        sigma: 0.05,
        startingValue: 50000,
        simulationCount: 200,
      };

      useShocks([0.01, -0.02, 0.005, 0.02]);

      const withdrawalInput: WithdrawalForecastInput = {
        ...shared,
        accumulationMonths: 12,
        decumulationMonths: 0,
        monthlyContribution: 1000,
        monthlyWithdrawal: 0,
        annualInflationRate: 0,
      };

      const accumulationInput = {
        ...shared,
        months: 12,
        monthlyInvestment: 1000,
      };

      const withdrawalResult = runWithdrawalForecast(withdrawalInput);
      useShocks([0.01, -0.02, 0.005, 0.02]);
      const accumulationResult =
        runGeometricBrownianMotionForecast(accumulationInput);

      expect(withdrawalResult.median).toEqual(accumulationResult.median);
      expect(withdrawalResult.confidenceLow).toEqual(
        accumulationResult.confidenceLow
      );
      expect(withdrawalResult.confidenceHigh).toEqual(
        accumulationResult.confidenceHigh
      );
      expect(withdrawalResult.cashFlows).toEqual(accumulationResult.cashFlows);
      expect(withdrawalResult.ruinProbability).toBe(0);
    });
  });

  describe("golden scenario (hand-computed)", () => {
    it("produces hand-computed balances and ruinProbability with deterministic zero shocks", () => {
      useShocks([0]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 1,
        decumulationMonths: 1,
        monthlyContribution: 500,
        monthlyWithdrawal: 2000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      // Month 0 (accumulation): preFlow = 1000 * exp(0) = 1000, +contribution 500 = 1500
      // Month 1 (decumulation): preFlow = 1500 * exp(0) = 1500, withdrawal 2000
      //   1500 < 2000 -> ruin, balance recorded as 0
      expect(result.median).toEqual([1500, 0]);
      expect(result.confidenceLow).toEqual([1500, 0]);
      expect(result.confidenceHigh).toEqual([1500, 0]);
      expect(result.cashFlows).toEqual([500, -1500]);
      expect(result.ruinProbability).toBe(1);
    });

    it("produces hand-computed balances with no ruin when withdrawal is covered", () => {
      useShocks([0]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 1,
        decumulationMonths: 1,
        monthlyContribution: 500,
        monthlyWithdrawal: 1000,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      // Month 0 (accumulation): 1000 * exp(0) + 500 = 1500
      // Month 1 (decumulation): 1500 * exp(0) = 1500, withdrawal 1000 -> 500
      expect(result.median).toEqual([1500, 500]);
      expect(result.cashFlows).toEqual([500, -500]);
      expect(result.ruinProbability).toBe(0);
    });

    it("produces hand-computed balances with a known non-zero shock", () => {
      const shock = Math.log(1.1); // exp(shock) = 1.1, i.e. +10% per month
      useShocks([shock]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 1,
        decumulationMonths: 1,
        monthlyContribution: 0,
        monthlyWithdrawal: 500,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      // Month 0 (accumulation): 1000 * 1.1 + 0 = 1100
      // Month 1 (decumulation): 1100 * 1.1 = 1210, withdrawal 500 -> 710
      expect(result.median).toEqual([1100, 710]);
      expect(result.cashFlows).toEqual([0, -500]);
      expect(result.ruinProbability).toBe(0);
    });
  });

  describe("invalid contributions", () => {
    it("does not treat a negative contribution as a withdrawal", () => {
      useShocks([0]);

      const input: WithdrawalForecastInput = {
        mu: 0,
        sigma: 0,
        startingValue: 1000,
        simulationCount: 1,
        accumulationMonths: 2,
        decumulationMonths: 0,
        monthlyContribution: -500,
        monthlyWithdrawal: 0,
        annualInflationRate: 0,
      };

      const result = runWithdrawalForecast(input);

      expect(result.median).toEqual([1000, 1000]);
      expect(result.cashFlows).toEqual([0, 0]);
      expect(result.ruinProbability).toBe(0);
    });
  });
});

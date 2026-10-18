import normal from "@stdlib/random/base/normal";
import { History } from "../portfolioHistory/history.entities";
import {
  ForecastConfig,
  ForecastInput,
  ForecastResult,
  GbmParameters,
  RandomShockParams,
  WithdrawalForecastInput,
  WithdrawalForecastResult,
} from "./forecast.entities";
import { getLogReturnStats } from "../logReturns";

const generateRandomNormalShocks = (params: RandomShockParams): number[][] => {
  const { mean, standardDeviation, simulationCount, timePeriodsCount } = params;
  const shocks: number[][] = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    const simulationShocks: number[] = [];
    for (let period = 0; period < timePeriodsCount; period++) {
      const normalValue = normal(mean, standardDeviation);
      simulationShocks.push(normalValue);
    }
    shocks.push(simulationShocks);
  }

  return shocks;
};

const percentileOfSorted = (sorted: number[], percentile: number): number => {
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) {
    return sorted[sorted.length - 1];
  }
  if (lower < 0) {
    return sorted[0];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

interface SimulationSummary extends ForecastResult {
  ruined: boolean[];
}

const summarizeSimulation = (
  portfolioValuesMatrix: number[][],
  cashFlows: number[],
  ruined: boolean[],
  config: ForecastConfig = {}
): SimulationSummary => {
  const { confidencePercentiles = [5, 95] } = config;
  const [lowPercentile, highPercentile] = confidencePercentiles;
  const months = cashFlows.length;

  const median: number[] = [];
  const confidenceLow: number[] = [];
  const confidenceHigh: number[] = [];

  for (let monthIndex = 0; monthIndex < months; monthIndex++) {
    const valuesForMonth = portfolioValuesMatrix
      .map((simulation) => simulation[monthIndex])
      .toSorted((a, b) => a - b);

    median.push(percentileOfSorted(valuesForMonth, 50));
    confidenceLow.push(percentileOfSorted(valuesForMonth, lowPercentile));
    confidenceHigh.push(percentileOfSorted(valuesForMonth, highPercentile));
  }

  return {
    median,
    confidenceLow,
    confidenceHigh,
    cashFlows,
    ruined,
  };
};

const buildAccumulationCashFlow = (
  months: number,
  monthlyInvestment: number
): number[] => Array.from({ length: months }, () => monthlyInvestment);

const buildWithdrawalCashFlow = (input: WithdrawalForecastInput): number[] => {
  const {
    accumulationMonths,
    decumulationMonths,
    monthlyContribution,
    monthlyWithdrawal,
    annualInflationRate,
  } = input;

  const totalMonths = accumulationMonths + decumulationMonths;
  const cashFlows: number[] = [];

  for (let m = 0; m < totalMonths; m++) {
    if (m < accumulationMonths) {
      cashFlows.push(monthlyContribution);
    } else {
      const monthsIntoDecumulation = m - accumulationMonths;
      const escalation = Math.pow(
        1 + annualInflationRate,
        monthsIntoDecumulation / 12
      );
      cashFlows.push(-monthlyWithdrawal * escalation);
    }
  }

  return cashFlows;
};

const runSinglePathWithCashFlows = (
  cashFlows: number[],
  shocks: number[],
  startingValue: number
): { values: number[]; ruined: boolean } => {
  const values: number[] = [];
  let balance = startingValue;
  let ruined = false;

  for (let m = 0; m < cashFlows.length; m++) {
    const preFlowBalance = balance * Math.exp(shocks[m]);
    const flow = cashFlows[m];

    if (flow < 0) {
      const intendedWithdrawal = -flow;
      if (!ruined && preFlowBalance < intendedWithdrawal) {
        ruined = true;
      }
      if (ruined) {
        values.push(0);
        balance = 0;
      } else {
        balance = preFlowBalance - intendedWithdrawal;
        values.push(balance);
      }
    } else {
      balance = preFlowBalance + flow;
      values.push(balance);
    }
  }

  return { values, ruined };
};

const simulate = (
  cashFlows: number[],
  mu: number,
  sigma: number,
  startingValue: number,
  simulationCount: number,
  config: ForecastConfig = {}
): SimulationSummary => {
  const months = cashFlows.length;

  const shocks = generateRandomNormalShocks({
    mean: mu,
    standardDeviation: sigma,
    simulationCount,
    timePeriodsCount: months,
  });

  const portfolioValuesMatrix: number[][] = [];
  const ruined: boolean[] = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    const path = runSinglePathWithCashFlows(
      cashFlows,
      shocks[sim],
      startingValue
    );
    portfolioValuesMatrix.push(path.values);
    ruined.push(path.ruined);
  }

  const cumulativeCashFlows = cashFlows.reduce<number[]>((acc, flow, index) => {
    acc.push((acc[index - 1] ?? 0) + flow);
    return acc;
  }, []);

  return summarizeSimulation(
    portfolioValuesMatrix,
    cumulativeCashFlows,
    ruined,
    config
  );
};

export const runGeometricBrownianMotionForecast = (
  input: ForecastInput,
  config: ForecastConfig = {}
): ForecastResult => {
  const {
    mu,
    sigma,
    months,
    monthlyInvestment,
    startingValue,
    simulationCount,
  } = input;

  const cashFlows = buildAccumulationCashFlow(months, monthlyInvestment);
  const summary = simulate(
    cashFlows,
    mu,
    sigma,
    startingValue,
    simulationCount,
    config
  );

  return {
    median: summary.median,
    confidenceLow: summary.confidenceLow,
    confidenceHigh: summary.confidenceHigh,
    cashFlows: summary.cashFlows,
  };
};

export const runWithdrawalForecast = (
  input: WithdrawalForecastInput,
  config: ForecastConfig = {}
): WithdrawalForecastResult => {
  const { mu, sigma, startingValue, simulationCount } = input;

  const cashFlows = buildWithdrawalCashFlow(input);
  const summary = simulate(
    cashFlows,
    mu,
    sigma,
    startingValue,
    simulationCount,
    config
  );

  const ruinProbability =
    simulationCount > 0
      ? summary.ruined.filter(Boolean).length / simulationCount
      : 0;

  return {
    median: summary.median,
    confidenceLow: summary.confidenceLow,
    confidenceHigh: summary.confidenceHigh,
    cashFlows: summary.cashFlows,
    ruinProbability,
  };
};

export const getGeometricBrownianMotionParams = (
  twrHistory: History<number>
): GbmParameters | undefined => {
  const stats = getLogReturnStats(twrHistory);
  if (!stats) {
    return undefined;
  }

  return {
    mu: stats.monthlyMu,
    sigma: stats.monthlySigma,
  };
};

export const applyInflationDiscount = (
  result: ForecastResult,
  inflationRate: number
): ForecastResult => {
  if (inflationRate === 0) {
    return result;
  }

  const discountFactor = (monthsElapsed: number): number =>
    Math.pow(1 + inflationRate, monthsElapsed / 12);

  const discountArray = (values: number[]): number[] =>
    values.map((value, index) => {
      const monthsElapsed = index + 1;
      return value / discountFactor(monthsElapsed);
    });

  return {
    median: discountArray(result.median),
    confidenceLow: discountArray(result.confidenceLow),
    confidenceHigh: discountArray(result.confidenceHigh),
    cashFlows: discountArray(result.cashFlows),
  };
};

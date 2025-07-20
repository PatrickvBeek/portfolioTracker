import normal from "@stdlib/random/base/normal";
import { sum } from "radash";
import { History } from "../portfolioHistory/history.entities";
import {
  ForecastConfig,
  ForecastInput,
  ForecastResult,
  GbmParameters,
  RandomShockParams,
  SimulationResult,
} from "./forecast.entities";

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

const runSingleSimulation = (
  input: ForecastInput,
  shocks: number[]
): SimulationResult => {
  const { months, startingValue, monthlyInvestment } = input;
  const portfolioValues: number[] = [];
  const totalSharesArray: number[] = [];
  const prices: number[] = [];

  let currentPrice = 100; // arbitrary starting point for relative price level
  let totalShares = startingValue / currentPrice;

  for (let m = 0; m < months; m++) {
    currentPrice *= Math.exp(shocks[m]);
    totalShares += monthlyInvestment / currentPrice;
    const portfolioValue = totalShares * currentPrice;

    portfolioValues.push(portfolioValue);
    totalSharesArray.push(totalShares);
    prices.push(currentPrice);
  }

  return {
    portfolioValues,
    totalShares: totalSharesArray,
    prices,
  };
};

const calculatePercentile = (values: number[], percentile: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  if (lower < 0) return sorted[0];

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

const calculateMedian = (values: number[]): number =>
  calculatePercentile(values, 50);

const calculateMean = (values: number[]): number => sum(values) / values.length;

const computeStatistics = (
  portfolioValuesMatrix: number[][],
  input: ForecastInput,
  config: ForecastConfig = {}
): ForecastResult => {
  const { months, monthlyInvestment } = input;
  const { confidencePercentiles = [5, 95] } = config;
  const [lowPercentile, highPercentile] = confidencePercentiles;

  const median: number[] = [];
  const mean: number[] = [];
  const confidenceLow: number[] = [];
  const confidenceHigh: number[] = [];
  const cashFlows: number[] = [];

  for (let monthIndex = 0; monthIndex < months; monthIndex++) {
    const valuesForMonth = portfolioValuesMatrix.map(
      (simulation) => simulation[monthIndex]
    );

    median.push(calculateMedian(valuesForMonth));
    mean.push(calculateMean(valuesForMonth));
    confidenceLow.push(calculatePercentile(valuesForMonth, lowPercentile));
    confidenceHigh.push(calculatePercentile(valuesForMonth, highPercentile));
    cashFlows.push((monthIndex + 1) * monthlyInvestment);
  }

  return {
    median,
    mean,
    confidenceLow,
    confidenceHigh,
    cashFlows,
  };
};

export const runGeometricBrownianMotionForecast = (
  input: ForecastInput,
  config: ForecastConfig = {}
): ForecastResult => {
  const { mu, sigma, months, simulationCount } = input;

  const shocks = generateRandomNormalShocks({
    mean: mu,
    standardDeviation: sigma,
    simulationCount,
    timePeriodsCount: months,
  });

  const portfolioValuesMatrix: number[][] = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    const simulationResult = runSingleSimulation(input, shocks[sim]);
    portfolioValuesMatrix.push(simulationResult.portfolioValues);
  }

  return computeStatistics(portfolioValuesMatrix, input, config);
};

export const getGeometricBrownianMotionParams = (
  twrHistory: History<number>
): GbmParameters | undefined => {
  if (twrHistory.length < 2) {
    return undefined;
  }

  // Calculate log returns assuming evenly spaced (!) data
  const logReturns: number[] = [];
  for (let i = 1; i < twrHistory.length; i++) {
    const logReturn = Math.log(twrHistory[i].value / twrHistory[i - 1].value);
    logReturns.push(logReturn);
  }

  const muRaw = calculateMean(logReturns);

  const meanSquaredDifference = logReturns.reduce((acc, value) => {
    const diff = value - muRaw;
    return acc + diff * diff;
  }, 0);

  const varianceRaw = meanSquaredDifference / logReturns.length;
  const sigmaRaw = Math.sqrt(varianceRaw);

  const totalTimeMs =
    twrHistory[twrHistory.length - 1].timestamp - twrHistory[0].timestamp;
  const numberOfSteps = twrHistory.length - 1;
  const averageStepMs = totalTimeMs / numberOfSteps;
  const averageStepsPerMonth = (1000 * 60 * 60 * 24 * 30.44) / averageStepMs; // Convert ms to months (avg days per month)

  // Normalize to monthly parameters
  const mu = muRaw * averageStepsPerMonth;
  const sigma = sigmaRaw * Math.sqrt(averageStepsPerMonth);

  return { mu, sigma };
};

export const gbmParamsToAnnualPercentage = (
  params: GbmParameters | undefined
) => ({
  mu: params && 100 * (Math.exp(12 * params.mu) - 1),
  sigma: params && 100 * (Math.exp(Math.sqrt(12) * params.sigma) - 1),
});

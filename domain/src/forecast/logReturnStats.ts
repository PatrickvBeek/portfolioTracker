import { sort } from "radash";
import { History } from "../portfolioHistory/history.entities";

type LogReturnStats = {
  meanLogReturn: number;
  stdLogReturn: number;
  stepsPerMonth: number;
};

export const getLogReturnStats = (
  history: History<number>
): LogReturnStats | undefined => {
  if (history.length < 2) {
    return undefined;
  }

  const sorted = sort(history, (p) => p.timestamp);

  // Calculate log returns assuming evenly spaced (!) data
  const logReturns: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    logReturns.push(Math.log(sorted[i].value / sorted[i - 1].value));
  }

  const meanLogReturn =
    logReturns.reduce((a, b) => a + b, 0) / logReturns.length;

  const meanSquaredDiff = logReturns.reduce(
    (acc, value) => acc + (value - meanLogReturn) ** 2,
    0
  );
  const varianceLogReturn = meanSquaredDiff / logReturns.length;
  const stdLogReturn = Math.sqrt(varianceLogReturn);

  const totalTimeMs = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
  const numberOfSteps = history.length - 1;
  const averageStepMs = totalTimeMs / numberOfSteps;
  const stepsPerMonth = (1000 * 60 * 60 * 24 * 30.44) / averageStepMs;

  return { meanLogReturn, stdLogReturn, stepsPerMonth };
};

type AssetReturnAndVolatility = {
  annualizedReturn: number;
  annualizedVolatility: number;
  ratio: number;
};

export const getAssetReturnAndVolatility = (
  prices: History<number>
): AssetReturnAndVolatility | undefined => {
  const stats = getLogReturnStats(prices);
  if (!stats) {
    return undefined;
  }

  const monthlyMu = stats.meanLogReturn * stats.stepsPerMonth;
  const monthlySigma = stats.stdLogReturn * Math.sqrt(stats.stepsPerMonth);

  const annualizedReturn = 100 * (Math.exp(12 * monthlyMu) - 1);
  const annualizedVolatility =
    100 * (Math.exp(Math.sqrt(12) * monthlySigma) - 1);
  const ratio = annualizedReturn / annualizedVolatility;

  return { annualizedReturn, annualizedVolatility, ratio };
};

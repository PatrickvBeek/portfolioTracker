import { sort } from "radash";
import { History } from "../portfolioHistory/history.entities";

type LogReturnStats = {
  meanLogReturn: number;
  stdLogReturn: number;
  stepsPerMonth: number;
  monthlyMu: number;
  monthlySigma: number;
  annualizedReturn: number;
  annualizedVolatility: number;
};

export const getLogReturnStats = (
  history: History<number>
): LogReturnStats | undefined => {
  if (history.length < 2) {
    return undefined;
  }

  const sorted = sort(history, (p) => p.timestamp);

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
  const varianceLogReturn =
    logReturns.length === 1 ? 0 : meanSquaredDiff / (logReturns.length - 1);
  const stdLogReturn = Math.sqrt(varianceLogReturn);

  const totalTimeMs = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
  const numberOfSteps = history.length - 1;
  const averageStepMs = totalTimeMs / numberOfSteps;
  const stepsPerMonth = (1000 * 60 * 60 * 24 * 30.44) / averageStepMs;

  const monthlyMu = meanLogReturn * stepsPerMonth;
  const monthlySigma = stdLogReturn * Math.sqrt(stepsPerMonth);

  const annualizedReturn = logReturnToPercentage(12 * monthlyMu);
  const annualizedVolatility = logReturnToPercentage(
    Math.sqrt(12) * monthlySigma
  );

  return {
    meanLogReturn,
    stdLogReturn,
    stepsPerMonth,
    monthlyMu,
    monthlySigma,
    annualizedReturn,
    annualizedVolatility,
  };
};

export const logReturnToPercentage = (logReturn: number): number =>
  100 * (Math.exp(logReturn) - 1);

export type AssetReturnAndVolatility = {
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

  const ratio = stats.annualizedReturn / stats.annualizedVolatility;

  return {
    annualizedReturn: stats.annualizedReturn,
    annualizedVolatility: stats.annualizedVolatility,
    ratio,
  };
};

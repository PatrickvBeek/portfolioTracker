import { History } from "../portfolioHistory/history.entities";

export type LogReturnStats = {
  meanLogReturn: number;
  stdLogReturn: number;
  stepsPerMonth: number;
  monthlyMu: number;
  monthlySigma: number;
  annualizedReturn: number;
  annualizedVolatility: number;
};

export type AssetReturnAndVolatility = {
  annualizedReturn: number;
  annualizedVolatility: number;
  ratio: number;
};

export type { History };

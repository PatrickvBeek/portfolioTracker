export interface ForecastInput {
  mu: number;
  sigma: number;
  months: number;
  monthlyInvestment: number;
  startingValue: number;
  simulationCount: number;
}

export interface ForecastResult {
  median: number[];
  confidenceLow: number[];
  confidenceHigh: number[];
  cashFlows: number[];
}

export interface WithdrawalForecastInput {
  mu: number;
  sigma: number;
  startingValue: number;
  simulationCount: number;
  accumulationMonths: number;
  decumulationMonths: number;
  monthlyContribution: number;
  monthlyWithdrawal: number;
  annualInflationRate: number;
}

export interface WithdrawalForecastResult extends ForecastResult {
  ruinProbability: number;
}

export interface RandomShockParams {
  mean: number;
  standardDeviation: number;
  simulationCount: number;
  timePeriodsCount: number;
}

export interface ForecastConfig {
  confidencePercentiles?: [number, number];
}

export type GbmParameters = {
  mu: number;
  sigma: number;
};

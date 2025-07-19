export interface ForecastInput {
  mu: number;
  sigma: number;
  months: number;
  monthlyInvestment: number;
  startingValue: number;
  simulationCount: number;
}

export interface SimulationResult {
  portfolioValues: number[];
  totalShares: number[];
  prices: number[];
}

export interface ForecastResult {
  median: number[];
  mean: number[];
  confidenceLow: number[];
  confidenceHigh: number[];
  cashFlows: number[];
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

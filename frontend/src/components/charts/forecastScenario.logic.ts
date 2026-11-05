import { GbmParameters, annualizeGbmParameters } from "pt-domain";
import { usePortfolioGeometricBrownianMotionParams } from "./chartHooks";

export type ForecastScenario = "market" | "portfolio";

const MU_MARKET = 0.00721;
const SIGMA_MARKET = 0.044;

const MARKET_PARAMS: GbmParameters = {
  mu: MU_MARKET,
  sigma: SIGMA_MARKET,
};

const FORECAST_SCENARIOS = {
  market: {
    params: MARKET_PARAMS,
    name: "Market (S&P 500)",
    description: "Based on historical S&P 500 performance since 1985",
  },
} as const;

export interface ScenarioDetails {
  params: GbmParameters;
  displayInfo: {
    name: string;
    description: string;
    annualReturnPercent: number;
    annualVolatilityPercent: number;
  };
}

export const usePortfolioScenarioParams = (
  portfolioNames: string[]
): GbmParameters | undefined =>
  usePortfolioGeometricBrownianMotionParams(portfolioNames, "Max");

const describeScenario = (
  params: GbmParameters,
  name: string,
  description: string
): ScenarioDetails => ({
  params,
  displayInfo: {
    name,
    description,
    ...annualizeGbmParameters(params),
  },
});

export const getScenarioDetails = (
  scenario: ForecastScenario,
  portfolioGbmParams: GbmParameters | undefined
): ScenarioDetails | undefined => {
  if (scenario === "market") {
    const marketScenario = FORECAST_SCENARIOS.market;
    return describeScenario(
      marketScenario.params,
      marketScenario.name,
      marketScenario.description
    );
  }

  if (portfolioGbmParams) {
    return describeScenario(
      portfolioGbmParams,
      "Your Portfolio",
      "Based on your portfolio's historical performance"
    );
  }

  return undefined;
};

export const useForecastScenarioParams = (
  portfolioNames: string[],
  scenario: ForecastScenario
): ScenarioDetails | undefined => {
  const portfolioGbmParams = usePortfolioScenarioParams(portfolioNames);
  return getScenarioDetails(scenario, portfolioGbmParams);
};

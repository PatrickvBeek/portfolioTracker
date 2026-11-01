import { GbmParameters, logReturnToPercentage } from "pt-domain";
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

interface ScenarioDetails {
  params: GbmParameters;
  displayInfo: {
    name: string;
    description: string;
    annualReturn: string;
    volatility: string;
    isAvailable: boolean;
  };
}

const usePortfolioScenarioParams = (
  portfolioNames: string[]
): GbmParameters | undefined =>
  usePortfolioGeometricBrownianMotionParams(portfolioNames, "Max");

const getScenarioDetails = (
  scenario: ForecastScenario,
  portfolioGbmParams: GbmParameters | undefined
): ScenarioDetails | undefined => {
  if (scenario === "market") {
    const marketScenario = FORECAST_SCENARIOS.market;
    const annualReturn = logReturnToPercentage(12 * marketScenario.params.mu);
    const annualVolatility = logReturnToPercentage(
      Math.sqrt(12) * marketScenario.params.sigma
    );
    return {
      params: marketScenario.params,
      displayInfo: {
        name: marketScenario.name,
        description: marketScenario.description,
        annualReturn: `${annualReturn.toFixed(1)}%`,
        volatility: `${annualVolatility.toFixed(1)}%`,
        isAvailable: true,
      },
    };
  }

  if (scenario === "portfolio" && portfolioGbmParams) {
    const annualReturn = logReturnToPercentage(12 * portfolioGbmParams.mu);
    const annualVolatility = logReturnToPercentage(
      Math.sqrt(12) * portfolioGbmParams.sigma
    );
    return {
      params: portfolioGbmParams,
      displayInfo: {
        name: "Your Portfolio",
        description: "Based on your portfolio's historical performance",
        annualReturn: `${annualReturn.toFixed(1)}%`,
        volatility: `${annualVolatility.toFixed(1)}%`,
        isAvailable: true,
      },
    };
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

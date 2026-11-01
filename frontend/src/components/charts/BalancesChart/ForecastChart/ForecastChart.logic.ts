import { ForecastInput, runGeometricBrownianMotionForecast } from "pt-domain";
import { useState } from "react";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import { useGetPortfoliosByNames } from "../../../../userDataContext";
import {
  useCashFlow,
  useMarketValue,
} from "../../../Portfolios/PortfolioSummary/PortfolioSummary.logic";
import {
  ForecastScenario,
  useForecastScenarioParams,
} from "../../forecastScenario.logic";
import {
  FORECAST_SIMULATION_COUNT,
  ForecastChartData,
  transformForecastToChartData,
} from "../../forecastChartUtils";

export const FORECAST_HORIZONS = {
  "1Y": "1Y",
  "3Y": "3Y",
  "5Y": "5Y",
  "10Y": "10Y",
  "20Y": "20Y",
  "30Y": "30Y",
} as const;
type ForecastHorizon =
  (typeof FORECAST_HORIZONS)[keyof typeof FORECAST_HORIZONS];

export const FORECAST_CONFIDENCE_LEVELS = {
  "50": 50,
  "68": 68,
  "90": 90,
} as const;
type ForecastConfidenceLevel =
  (typeof FORECAST_CONFIDENCE_LEVELS)[keyof typeof FORECAST_CONFIDENCE_LEVELS];

export interface ForecastParameters {
  scenario: ForecastScenario;
  timeHorizon: ForecastHorizon;
  monthlyContribution: number;
  confidenceLevel: ForecastConfidenceLevel;
  inflationRate: number;
}

const FORECAST_HORIZON_MONTHS: Record<ForecastHorizon, number> = {
  "1Y": 12,
  "3Y": 36,
  "5Y": 60,
  "10Y": 120,
  "20Y": 240,
  "30Y": 360,
};

export const useForecastChartData = (
  portfolioNames: string[],
  params: ForecastParameters
): CustomQuery<ForecastChartData> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const { data, isError, isLoading } = useMarketValue(portfolioNames);
  const currentValue = data ?? 0;
  const currentCashFlow = useCashFlow(portfolioNames) ?? 0;
  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    params.scenario
  );
  const [startTimestamp] = useState(() => Date.now());

  if (portfolios.length === 0 || !scenarioDetails) {
    return { isError, isLoading, data: [] };
  }

  const months = FORECAST_HORIZON_MONTHS[params.timeHorizon];

  const forecastInput: ForecastInput = {
    mu: scenarioDetails.params.mu,
    sigma: scenarioDetails.params.sigma,
    months,
    monthlyInvestment: params.monthlyContribution,
    startingValue: currentValue,
    simulationCount: FORECAST_SIMULATION_COUNT,
  };

  const confidencePercentiles: [number, number] = [
    50 - params.confidenceLevel / 2,
    50 + params.confidenceLevel / 2,
  ];

  const forecastResult = runGeometricBrownianMotionForecast(forecastInput, {
    confidencePercentiles,
  });

  const forecastData = transformForecastToChartData(
    forecastResult,
    startTimestamp,
    currentCashFlow,
    params.inflationRate
  );

  return {
    isLoading,
    isError,
    data: forecastData,
  };
};

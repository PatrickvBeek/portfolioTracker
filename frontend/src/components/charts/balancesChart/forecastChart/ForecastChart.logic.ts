import {
  applyInflationDiscount,
  ForecastInput,
  ForecastResult,
  GbmParameters,
  gbmParamsToAnnualPercentage,
  runGeometricBrownianMotionForecast,
} from "pt-domain";
import { useMemo } from "react";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { CustomQuery } from "../../../../hooks/prices/priceHooks";
import {
  useCashFlow,
  useMarketValue,
} from "../../../Portfolios/portfolioSummary/PortfolioSummary.logic";
import { usePortfolioGeometricBrownianMotionParams } from "../../chartHooks";
import { ChartDataPoint } from "../../chartTypes";

export const FORECAST_HORIZONS = {
  "1Y": "1Y",
  "3Y": "3Y",
  "5Y": "5Y",
  "10Y": "10Y",
  "20Y": "20Y",
  "30Y": "30Y",
} as const;
export type ForecastHorizon =
  (typeof FORECAST_HORIZONS)[keyof typeof FORECAST_HORIZONS];

export type ForecastScenario = "market" | "portfolio";
export type ForecastChartDataSets =
  | "median"
  | "mean"
  | "uncertaintyBand"
  | "cashFlow";
export type ForecastChartData = ChartDataPoint<ForecastChartDataSets>[];

export const FORECAST_CONFIDENCE_LEVELS = {
  "50": 50,
  "68": 68,
  "90": 90,
} as const;
export type ForecastConfidenceLevel =
  (typeof FORECAST_CONFIDENCE_LEVELS)[keyof typeof FORECAST_CONFIDENCE_LEVELS];

export interface ForecastParameters {
  scenario: ForecastScenario;
  timeHorizon: ForecastHorizon;
  monthlyContribution: number;
  confidenceLevel: ForecastConfidenceLevel;
  inflationRate: number;
}

const FORECAST_SCENARIOS = {
  market: {
    params: { mu: 0.00721, sigma: 0.044 },
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

export const useForecastScenarioParams = (
  portfolioName: string,
  scenario: ForecastScenario
): ScenarioDetails | undefined => {
  const portfolioGbmParams =
    usePortfolioGeometricBrownianMotionParams(portfolioName);

  return useMemo(() => {
    if (scenario === "market") {
      const marketScenario = FORECAST_SCENARIOS.market;
      const annualParams = gbmParamsToAnnualPercentage(marketScenario.params);
      return {
        params: marketScenario.params,
        displayInfo: {
          name: marketScenario.name,
          description: marketScenario.description,
          annualReturn: `${annualParams.mu?.toFixed(1)}%`,
          volatility: `${annualParams.sigma?.toFixed(1)}%`,
          isAvailable: true,
        },
      };
    }

    if (scenario === "portfolio" && portfolioGbmParams) {
      const annualParams = gbmParamsToAnnualPercentage(portfolioGbmParams);
      return {
        params: portfolioGbmParams,
        displayInfo: {
          name: "Your Portfolio",
          description: "Based on your portfolio's historical performance",
          annualReturn: `${annualParams.mu?.toFixed(1)}%`,
          volatility: `${annualParams.sigma?.toFixed(1)}%`,
          isAvailable: true,
        },
      };
    }

    return undefined;
  }, [portfolioGbmParams, scenario]);
};

const FORECAST_HORIZON_MONTHS: Record<ForecastHorizon, number> = {
  "1Y": 12,
  "3Y": 36,
  "5Y": 60,
  "10Y": 120,
  "20Y": 240,
  "30Y": 360,
};

const transformForecastToChartData = (
  forecastResult: ForecastResult,
  startTimestamp: number,
  currentCashFlow: number,
  inflationRate: number
): ForecastChartData => {
  const discountedResult = applyInflationDiscount(
    forecastResult,
    inflationRate
  );
  const { median, mean, confidenceLow, confidenceHigh, cashFlows } =
    discountedResult;
  const monthInMs = 30 * 24 * 60 * 60 * 1000;

  return median.map((_: number, index: number) => ({
    timestamp: startTimestamp + (index + 1) * monthInMs,
    median: median[index],
    mean: mean[index],
    uncertaintyBand: [confidenceLow[index], confidenceHigh[index]],
    cashFlow: currentCashFlow + cashFlows[index],
  }));
};

export const useForecastChartData = (
  portfolioName: string,
  params: ForecastParameters
): CustomQuery<ForecastChartData> => {
  const portfolio = useGetPortfolio(portfolioName);
  const { data, isError, isLoading } = useMarketValue(portfolioName) ?? {
    data: 0,
    isError: false,
    isLoading: false,
  };
  const currentValue = data ?? 0;
  const currentCashFlow = useCashFlow(portfolioName) ?? 0;
  const scenarioDetails = useForecastScenarioParams(
    portfolioName,
    params.scenario
  );

  if (!portfolio || !scenarioDetails) {
    return { isError, isLoading, data: [] };
  }

  const months = FORECAST_HORIZON_MONTHS[params.timeHorizon];
  const startTimestamp = Date.now();

  const forecastInput: ForecastInput = {
    mu: scenarioDetails.params.mu,
    sigma: scenarioDetails.params.sigma,
    months,
    monthlyInvestment: params.monthlyContribution,
    startingValue: currentValue,
    simulationCount: 1000,
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

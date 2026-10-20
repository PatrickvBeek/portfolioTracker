import {
  GbmParameters,
  WithdrawalForecastInput,
  runWithdrawalForecast,
} from "pt-domain";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { CustomQuery } from "../../hooks/prices/priceHooks";
import { useGetPortfoliosByNames } from "../../userDataContext";
import {
  useCashFlow,
  useMarketValue,
  usePortfolioAge,
} from "../Portfolios/PortfolioSummary/PortfolioSummary.logic";
import {
  ForecastChartData,
  ForecastChartDataSets,
  transformForecastToChartData,
} from "../charts/forecastChartUtils";
import {
  useForecastScenarioParams,
  ForecastScenario,
} from "../charts/BalancesChart/ForecastChart/ForecastChart.logic";

export type WithdrawalChartDataSets = ForecastChartDataSets;
type WithdrawalChartData = ForecastChartData;

export interface WithdrawalPlannerParameters {
  scenario: ForecastScenario;
  accumulationYears: number;
  accumulationMonths: number;
  decumulationYears: number;
  decumulationMonths: number;
  monthlyContribution: number | null;
  monthlyWithdrawal: number;
}

interface WithdrawalForecastArgs {
  input: WithdrawalForecastInput;
  startTimestamp: number;
  currentCashFlow: number;
  inflationRate: number;
}

interface WithdrawalForecastArgsInput {
  parameters: WithdrawalPlannerParameters;
  startingValue: number;
  monthlyContribution: number;
  currentCashFlow: number;
  gbmParams: GbmParameters;
  inflationRate: number;
  startTimestamp: number;
}

const SIMULATION_COUNT = 1000;
const SLICE_ANNUAL_INFLATION_RATE = 0;
const PARAMETER_DEBOUNCE_MS = 500;

const monthsFromYearsMonths = (years: number, months: number): number =>
  years * 12 + months;

export const parseNonNegativeInt = (value: string): number =>
  Math.max(0, parseInt(value, 10) || 0);

export const parseNonNegativeNumber = (value: string): number =>
  Math.max(0, parseFloat(value) || 0);

const buildWithdrawalForecastArgs = ({
  parameters,
  startingValue,
  monthlyContribution,
  currentCashFlow,
  gbmParams,
  inflationRate,
  startTimestamp,
}: WithdrawalForecastArgsInput): WithdrawalForecastArgs => {
  const accumulationMonths = monthsFromYearsMonths(
    parameters.accumulationYears,
    parameters.accumulationMonths
  );
  const decumulationMonths = monthsFromYearsMonths(
    parameters.decumulationYears,
    parameters.decumulationMonths
  );

  const input: WithdrawalForecastInput = {
    mu: gbmParams.mu,
    sigma: gbmParams.sigma,
    startingValue,
    simulationCount: SIMULATION_COUNT,
    accumulationMonths,
    decumulationMonths,
    monthlyContribution,
    monthlyWithdrawal: parameters.monthlyWithdrawal,
    annualInflationRate: inflationRate,
  };

  return {
    input,
    startTimestamp,
    currentCashFlow,
    inflationRate,
  };
};

export interface WithdrawalPlannerQueryData {
  ruinProbability: number;
  chartData: WithdrawalChartData;
  monthlyContribution: number;
}

export const useWithdrawalPlannerData = (
  portfolioNames: string[],
  parameters: WithdrawalPlannerParameters
): CustomQuery<WithdrawalPlannerQueryData> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const marketValueQuery = useMarketValue(portfolioNames);
  const cashFlow = useCashFlow(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);
  const debouncedParameters = useDebouncedValue(
    parameters,
    PARAMETER_DEBOUNCE_MS
  );
  const [startTimestamp] = useState(() => Date.now());
  const derivedMonthlyContribution =
    portfolioAge > 0 ? 50 * Math.round(cashFlow / portfolioAge / 12 / 50) : 0;
  const monthlyContribution =
    debouncedParameters.monthlyContribution ?? derivedMonthlyContribution;
  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    debouncedParameters.scenario
  );
  const inflationRate = SLICE_ANNUAL_INFLATION_RATE;
  const { data: marketValue, isLoading, isError } = marketValueQuery;
  const startingValue = marketValue ?? NaN;
  const hasPortfolios = portfolios.length > 0;
  const scenarioParams = scenarioDetails?.params;
  const scenarioMu = scenarioParams?.mu;
  const scenarioSigma = scenarioParams?.sigma;

  return useMemo(() => {
    if (isLoading) {
      return { isLoading: true, isError: false, data: undefined };
    }
    if (isError || !Number.isFinite(startingValue)) {
      return { isLoading: false, isError: true, data: undefined };
    }
    if (
      !hasPortfolios ||
      scenarioMu === undefined ||
      scenarioSigma === undefined
    ) {
      return { isLoading: false, isError: false, data: undefined };
    }

    const args = buildWithdrawalForecastArgs({
      parameters: debouncedParameters,
      startingValue,
      monthlyContribution,
      currentCashFlow: cashFlow,
      gbmParams: { mu: scenarioMu, sigma: scenarioSigma },
      inflationRate,
      startTimestamp,
    });

    const result = runWithdrawalForecast(args.input);
    const chartData = transformForecastToChartData(
      result,
      args.startTimestamp,
      args.currentCashFlow,
      args.inflationRate
    );

    return {
      isLoading: false,
      isError: false,
      data: {
        ruinProbability: result.ruinProbability,
        chartData,
        monthlyContribution,
      },
    };
  }, [
    hasPortfolios,
    scenarioMu,
    scenarioSigma,
    startingValue,
    isLoading,
    isError,
    monthlyContribution,
    cashFlow,
    debouncedParameters,
    inflationRate,
    startTimestamp,
  ]);
};

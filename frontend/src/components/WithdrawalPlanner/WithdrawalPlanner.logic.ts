import {
  GbmParameters,
  WithdrawalForecastInput,
  runWithdrawalForecast,
} from "pt-domain";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { CustomQuery } from "../../hooks/prices/priceHooks";
import { addMonths } from "../../utility/dates";
import { useGetPortfoliosByNames } from "../../userDataContext";
import {
  useCashFlow,
  useMarketValue,
  usePortfolioAge,
} from "../Portfolios/PortfolioSummary/PortfolioSummary.logic";
import {
  FORECAST_DEBOUNCE_MS,
  FORECAST_SIMULATION_COUNT,
  ForecastChartData,
  deriveMonthlyContribution,
  transformForecastToChartData,
} from "../charts/forecastChartUtils";
import {
  useForecastScenarioParams,
  ForecastScenario,
} from "../charts/forecastScenario.logic";

export const MAX_PLAN_YEARS = 60;
export const MAX_MONTHLY_WITHDRAWAL = 10_000;
export const WITHDRAWAL_CONFIDENCE_PERCENT = 90;
export const WITHDRAWAL_CONFIDENCE_PERCENTILES: [number, number] = [
  50 - WITHDRAWAL_CONFIDENCE_PERCENT / 2,
  50 + WITHDRAWAL_CONFIDENCE_PERCENT / 2,
];

export interface WithdrawalPlannerParameters {
  scenario: ForecastScenario;
  accumulationYears: number;
  decumulationYears: number;
  monthlyContribution: number | null;
  monthlyWithdrawal: number | null;
  inflationRate: number;
}

interface WithdrawalForecastArgsInput {
  parameters: WithdrawalPlannerParameters;
  startingValue: number;
  derivedContribution: number | undefined;
  gbmParams: GbmParameters;
}

export const yearsToMonths = (years: number): number => Math.round(years * 12);

export const hasPositivePhase = (
  accumulationYears: number,
  decumulationYears: number
): boolean =>
  yearsToMonths(accumulationYears) + yearsToMonths(decumulationYears) > 0;

export const parseYears = (value: string): number => {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(MAX_PLAN_YEARS, Math.max(0, Math.trunc(parsed)));
};

export const parseNonNegativeNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export const parseMonthlyWithdrawal = (value: string): number =>
  Math.min(MAX_MONTHLY_WITHDRAWAL, parseNonNegativeNumber(value));

export const parseInflationPercent = (value: string): number =>
  Math.min(20, parseNonNegativeNumber(value)) / 100;

const PLAN_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export interface PlanDates {
  retirementLabel: string;
  planEndLabel: string;
}

export const buildPlanDates = (
  planStart: number,
  accumulationYears: number,
  decumulationYears: number
): PlanDates => {
  const accumulationMonths = yearsToMonths(accumulationYears);
  const decumulationMonths = yearsToMonths(decumulationYears);
  const retirementDate = addMonths(planStart, accumulationMonths);
  const planEndDate = addMonths(
    planStart,
    accumulationMonths + decumulationMonths
  );

  return {
    retirementLabel:
      accumulationMonths === 0
        ? "Retire now"
        : `Retire around ${PLAN_DATE_FORMATTER.format(retirementDate)}`,
    planEndLabel:
      decumulationMonths === 0
        ? "No withdrawal phase"
        : `Plan ends around ${PLAN_DATE_FORMATTER.format(planEndDate)}`,
  };
};

export const buildWithdrawalForecastArgs = ({
  parameters,
  startingValue,
  derivedContribution,
  gbmParams,
}: WithdrawalForecastArgsInput): WithdrawalForecastInput => ({
  mu: gbmParams.mu,
  sigma: gbmParams.sigma,
  startingValue,
  simulationCount: FORECAST_SIMULATION_COUNT,
  accumulationMonths: yearsToMonths(parameters.accumulationYears),
  decumulationMonths: yearsToMonths(parameters.decumulationYears),
  monthlyContribution:
    parameters.monthlyContribution ?? derivedContribution ?? 0,
  monthlyWithdrawal: parameters.monthlyWithdrawal ?? derivedContribution ?? 0,
  annualInflationRate: parameters.inflationRate,
});

interface WithdrawalPlannerQueryData {
  ruinProbability: number;
  chartData: ForecastChartData;
}

export const useDerivedMonthlyContribution = (
  portfolioNames: string[]
): number | undefined => {
  const cashFlow = useCashFlow(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);

  return deriveMonthlyContribution(cashFlow, portfolioAge);
};

export interface WithdrawalPlannerHookResult extends CustomQuery<WithdrawalPlannerQueryData> {
  planStart: number;
  derivedContribution: number | undefined;
}

export const useWithdrawalPlannerData = (
  portfolioNames: string[],
  parameters: WithdrawalPlannerParameters
): WithdrawalPlannerHookResult => {
  const [planStart] = useState(() => Date.now());
  const derivedContribution = useDerivedMonthlyContribution(portfolioNames);
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const marketValueQuery = useMarketValue(portfolioNames);
  const cashFlow = useCashFlow(portfolioNames);
  const debouncedParameters = useDebouncedValue(
    parameters,
    FORECAST_DEBOUNCE_MS
  );
  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    debouncedParameters.scenario
  );
  const { data: marketValue, isLoading, isError } = marketValueQuery;
  const startingValue = marketValue ?? NaN;
  const hasPortfolios = portfolios.length > 0;
  const planHasPositivePhase = hasPositivePhase(
    parameters.accumulationYears,
    parameters.decumulationYears
  );
  const debouncedPlanHasPositivePhase = hasPositivePhase(
    debouncedParameters.accumulationYears,
    debouncedParameters.decumulationYears
  );
  const waitingForFreshPlan =
    planHasPositivePhase && !debouncedPlanHasPositivePhase;
  const scenarioParams = scenarioDetails?.params;
  const scenarioMu = scenarioParams?.mu;
  const scenarioSigma = scenarioParams?.sigma;

  const query = useMemo(() => {
    if (!planHasPositivePhase || waitingForFreshPlan) {
      return {
        isLoading: waitingForFreshPlan,
        isError: false,
        data: undefined,
      };
    }
    const hasValueError = isError || !Number.isFinite(startingValue);

    if (isLoading || hasValueError) {
      return {
        isLoading,
        isError: !isLoading && hasValueError,
        data: undefined,
      };
    }
    if (
      !hasPortfolios ||
      scenarioMu === undefined ||
      scenarioSigma === undefined
    ) {
      return { isLoading: false, isError: false, data: undefined };
    }

    const forecastInput = buildWithdrawalForecastArgs({
      parameters: debouncedParameters,
      startingValue,
      derivedContribution,
      gbmParams: { mu: scenarioMu, sigma: scenarioSigma },
    });

    const result = runWithdrawalForecast(forecastInput, {
      confidencePercentiles: WITHDRAWAL_CONFIDENCE_PERCENTILES,
    });
    const chartData = transformForecastToChartData(
      result,
      planStart,
      cashFlow,
      debouncedParameters.inflationRate
    );

    return {
      isLoading: false,
      isError: false,
      data: {
        ruinProbability: result.ruinProbability,
        chartData,
      },
    };
  }, [
    planHasPositivePhase,
    waitingForFreshPlan,
    hasPortfolios,
    scenarioMu,
    scenarioSigma,
    startingValue,
    isLoading,
    isError,
    derivedContribution,
    cashFlow,
    debouncedParameters,
    planStart,
  ]);

  return { ...query, planStart, derivedContribution };
};

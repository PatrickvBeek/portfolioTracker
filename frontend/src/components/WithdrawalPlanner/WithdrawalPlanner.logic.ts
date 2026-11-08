import {
  GbmParameters,
  WithdrawalForecastInput,
  WithdrawalForecastResult,
  applyInflationDiscount,
  runWithdrawalForecast,
} from "pt-domain";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
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
  buildForecastChartData,
  deriveMonthlyContribution,
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

export interface WithdrawalResultSummary {
  ruinedCount: number;
  simulationCount: number;
  atRetirement: number;
  atPlanEnd: number;
  isMedianRuined: boolean;
}

const roundsToZero = (value: number): boolean => Math.round(value) === 0;

export const buildWithdrawalResultSummary = (input: {
  ruinedCount: number;
  simulationCount: number;
  accumulationMonths: number;
  startingValue: number;
  median: number[];
}): WithdrawalResultSummary => {
  const atRetirement =
    input.accumulationMonths === 0
      ? input.startingValue
      : input.median[input.accumulationMonths - 1];
  const atPlanEnd = input.median[input.median.length - 1];

  return {
    ruinedCount: input.ruinedCount,
    simulationCount: input.simulationCount,
    atRetirement,
    atPlanEnd,
    isMedianRuined: roundsToZero(atPlanEnd),
  };
};

interface WithdrawalPlannerResultData {
  summary: WithdrawalResultSummary;
  chartData: ForecastChartData;
}

export type WithdrawalPlannerResultState =
  | { status: "loading" }
  | { status: "updating"; result: WithdrawalPlannerResultData }
  | { status: "error"; kind: "marketValue" | "calculation" }
  | { status: "unavailable" }
  | { status: "ready"; result: WithdrawalPlannerResultData };

export interface WithdrawalPlanReadinessInput {
  hasPositivePhase: boolean;
  waitingForFreshPlan: boolean;
  isLoading: boolean;
  isMarketValueError: boolean;
  marketValue: number | undefined;
  hasPortfolios: boolean;
  scenario: GbmParameters | undefined;
}

export type WithdrawalPlanReadiness =
  | { status: "loading" }
  | { status: "error"; kind: "marketValue" }
  | { status: "unavailable" }
  | { status: "ready"; startingValue: number; mu: number; sigma: number };

const resolveAvailablePlan = (
  input: WithdrawalPlanReadinessInput
): WithdrawalPlanReadiness => {
  if (
    input.isMarketValueError ||
    input.marketValue === undefined ||
    !Number.isFinite(input.marketValue)
  ) {
    return { status: "error", kind: "marketValue" };
  }
  if (!input.hasPortfolios || input.scenario === undefined) {
    return { status: "unavailable" };
  }

  return {
    status: "ready",
    startingValue: input.marketValue,
    mu: input.scenario.mu,
    sigma: input.scenario.sigma,
  };
};

export const resolvePlanReadiness = (
  input: WithdrawalPlanReadinessInput
): WithdrawalPlanReadiness => {
  if (input.waitingForFreshPlan) {
    return { status: "loading" };
  }
  if (!input.hasPositivePhase) {
    return { status: "unavailable" };
  }
  if (input.isLoading) {
    return { status: "loading" };
  }

  return resolveAvailablePlan(input);
};

export interface WithdrawalPlanInputs {
  parameters: WithdrawalPlannerParameters;
  startingValue: number;
  mu: number;
  sigma: number;
  derivedContribution: number | undefined;
  cashFlow: number;
  planStart: number;
  confidencePercentiles: [number, number];
}

export type SimulateWithdrawal = (
  input: WithdrawalForecastInput,
  config: { confidencePercentiles: [number, number] }
) => WithdrawalForecastResult;

export type WithdrawalPlanComputation =
  | { status: "idle" }
  | { status: "computed"; result: WithdrawalPlannerResultData }
  | { status: "failed" };

export const computeWithdrawalResult = (
  inputs: WithdrawalPlanInputs,
  simulate: SimulateWithdrawal = runWithdrawalForecast
): WithdrawalPlanComputation => {
  const forecastInput = buildWithdrawalForecastArgs({
    parameters: inputs.parameters,
    startingValue: inputs.startingValue,
    derivedContribution: inputs.derivedContribution,
    gbmParams: { mu: inputs.mu, sigma: inputs.sigma },
  });

  let forecast: WithdrawalForecastResult;
  try {
    forecast = simulate(forecastInput, {
      confidencePercentiles: inputs.confidencePercentiles,
    });
  } catch (error) {
    console.error("Withdrawal forecast simulation failed", error);
    return { status: "failed" };
  }

  const discounted = applyInflationDiscount(
    forecast,
    inputs.parameters.inflationRate
  );

  return {
    status: "computed",
    result: {
      summary: buildWithdrawalResultSummary({
        ruinedCount: Math.round(
          forecast.ruinProbability * forecastInput.simulationCount
        ),
        simulationCount: forecastInput.simulationCount,
        accumulationMonths: forecastInput.accumulationMonths,
        startingValue: inputs.startingValue,
        median: discounted.median,
      }),
      chartData: buildForecastChartData(
        discounted,
        inputs.planStart,
        inputs.cashFlow
      ),
    },
  };
};

export const resolveWithdrawalPlannerState = (
  readiness: WithdrawalPlanReadiness,
  computation: WithdrawalPlanComputation,
  isUpdating: boolean
): WithdrawalPlannerResultState => {
  if (readiness.status !== "ready") {
    return readiness;
  }
  if (computation.status === "failed") {
    return { status: "error", kind: "calculation" };
  }
  if (computation.status !== "computed") {
    return { status: "loading" };
  }

  return isUpdating
    ? { status: "updating", result: computation.result }
    : { status: "ready", result: computation.result };
};

export const useDerivedMonthlyContribution = (
  portfolioNames: string[]
): number | undefined => {
  const cashFlow = useCashFlow(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);

  return deriveMonthlyContribution(cashFlow, portfolioAge);
};

export interface WithdrawalPlannerHookResult {
  state: WithdrawalPlannerResultState;
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
  const { value: debouncedParameters, isPending: isUpdating } =
    useDebouncedValue(parameters, FORECAST_DEBOUNCE_MS);
  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    debouncedParameters.scenario
  );
  const { data: marketValue, isLoading, isError } = marketValueQuery;
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

  const readiness = useMemo(
    () =>
      resolvePlanReadiness({
        hasPositivePhase: planHasPositivePhase,
        waitingForFreshPlan,
        isLoading,
        isMarketValueError: isError,
        marketValue,
        hasPortfolios,
        scenario:
          scenarioMu === undefined || scenarioSigma === undefined
            ? undefined
            : { mu: scenarioMu, sigma: scenarioSigma },
      }),
    [
      planHasPositivePhase,
      waitingForFreshPlan,
      isLoading,
      isError,
      marketValue,
      hasPortfolios,
      scenarioMu,
      scenarioSigma,
    ]
  );

  const computation = useMemo<WithdrawalPlanComputation>(
    () =>
      readiness.status === "ready"
        ? computeWithdrawalResult({
            parameters: debouncedParameters,
            startingValue: readiness.startingValue,
            mu: readiness.mu,
            sigma: readiness.sigma,
            derivedContribution,
            cashFlow,
            planStart,
            confidencePercentiles: WITHDRAWAL_CONFIDENCE_PERCENTILES,
          })
        : { status: "idle" },
    [readiness, debouncedParameters, derivedContribution, cashFlow, planStart]
  );

  const state = useMemo(
    () => resolveWithdrawalPlannerState(readiness, computation, isUpdating),
    [readiness, computation, isUpdating]
  );

  return { state, planStart, derivedContribution };
};

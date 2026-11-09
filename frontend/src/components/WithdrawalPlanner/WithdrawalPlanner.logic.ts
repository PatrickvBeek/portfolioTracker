import {
  GbmParameters,
  WithdrawalForecastInput,
  WithdrawalForecastResult,
  applyInflationDiscount,
  runWithdrawalForecast,
} from "pt-domain";
import { useState } from "react";
import { addMonths } from "../../utility/dates";
import { useGetPortfoliosByNames } from "../../userDataContext";
import {
  useCashFlow,
  useMarketValue,
  usePortfolioAge,
} from "../Portfolios/PortfolioSummary/PortfolioSummary.logic";
import {
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
const WITHDRAWAL_CONFIDENCE_PERCENTILES: [number, number] = [
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

export type ResolvedWithdrawalPlannerParameters = Omit<
  WithdrawalPlannerParameters,
  "monthlyContribution" | "monthlyWithdrawal"
> & {
  monthlyContribution: number;
  monthlyWithdrawal: number;
};

interface WithdrawalForecastArgsInput {
  parameters: ResolvedWithdrawalPlannerParameters;
  startingValue: number;
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

export const resolvePlanParameters = (
  parameters: WithdrawalPlannerParameters,
  derivedContribution: number | undefined
): ResolvedWithdrawalPlannerParameters => ({
  ...parameters,
  monthlyContribution:
    parameters.monthlyContribution ?? derivedContribution ?? 0,
  monthlyWithdrawal: parameters.monthlyWithdrawal ?? derivedContribution ?? 0,
});

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
  gbmParams,
}: WithdrawalForecastArgsInput): WithdrawalForecastInput => ({
  mu: gbmParams.mu,
  sigma: gbmParams.sigma,
  startingValue,
  simulationCount: FORECAST_SIMULATION_COUNT,
  accumulationMonths: yearsToMonths(parameters.accumulationYears),
  decumulationMonths: yearsToMonths(parameters.decumulationYears),
  monthlyContribution: parameters.monthlyContribution,
  monthlyWithdrawal: parameters.monthlyWithdrawal,
  annualInflationRate: parameters.inflationRate,
});

export interface WithdrawalResultSummary {
  ruinedCount: number;
  simulationCount: number;
  atRetirement: number;
  atPlanEnd: number;
  isMedianRuined: boolean;
}

export const roundsToZero = (value: number): boolean => Math.round(value) === 0;

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

export interface WithdrawalPlannerResultData {
  summary: WithdrawalResultSummary;
  chartData: ForecastChartData;
}

interface SubmittedWithdrawalPlan {
  status: "ready";
  scenario: ForecastScenario;
  result: WithdrawalPlannerResultData;
}

export type WithdrawalPlannerResultState =
  | { status: "idle" }
  | { status: "error" }
  | { status: "unavailable" }
  | SubmittedWithdrawalPlan;

export interface WithdrawalPlanReadinessInput {
  isLoading: boolean;
  isMarketValueError: boolean;
  marketValue: number | undefined;
  hasPortfolios: boolean;
  scenario: GbmParameters | undefined;
}

export type WithdrawalPlanReadiness =
  | { status: "loading" }
  | { status: "error" }
  | { status: "unavailable" }
  | { status: "ready"; startingValue: number; mu: number; sigma: number };

export const resolvePlanReadiness = (
  input: WithdrawalPlanReadinessInput
): WithdrawalPlanReadiness => {
  if (input.isLoading) {
    return { status: "loading" };
  }
  if (
    input.isMarketValueError ||
    input.marketValue === undefined ||
    !Number.isFinite(input.marketValue)
  ) {
    return { status: "error" };
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

export interface WithdrawalPlanInputs {
  parameters: ResolvedWithdrawalPlannerParameters;
  startingValue: number;
  mu: number;
  sigma: number;
  cashFlow: number;
  planStart: number;
}

export const buildWithdrawalPlannerResult = (
  forecast: WithdrawalForecastResult,
  forecastInput: WithdrawalForecastInput,
  inputs: WithdrawalPlanInputs
): WithdrawalPlannerResultData => {
  const discounted = applyInflationDiscount(
    forecast,
    inputs.parameters.inflationRate
  );

  return {
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
  };
};

export const computeWithdrawalResult = (
  inputs: WithdrawalPlanInputs
): WithdrawalPlannerResultData => {
  const forecastInput = buildWithdrawalForecastArgs({
    parameters: inputs.parameters,
    startingValue: inputs.startingValue,
    gbmParams: { mu: inputs.mu, sigma: inputs.sigma },
  });
  const forecast = runWithdrawalForecast(forecastInput, {
    confidencePercentiles: WITHDRAWAL_CONFIDENCE_PERCENTILES,
  });

  return buildWithdrawalPlannerResult(forecast, forecastInput, inputs);
};

export interface WithdrawalPlannerHookResult {
  state: WithdrawalPlannerResultState;
  canSimulate: boolean;
  planStart: number;
  derivedContribution: number | undefined;
  simulate: () => void;
}

const resolveDisplayState = (
  readiness: WithdrawalPlanReadiness
): WithdrawalPlannerResultState => {
  if (readiness.status === "error") {
    return { status: "error" };
  }
  if (readiness.status === "unavailable") {
    return { status: "unavailable" };
  }

  return { status: "idle" };
};

export const useWithdrawalPlanner = (
  portfolioNames: string[],
  parameters: WithdrawalPlannerParameters
): WithdrawalPlannerHookResult => {
  const [planStart] = useState(() => Date.now());
  const [submitted, setSubmitted] = useState<SubmittedWithdrawalPlan | null>(
    null
  );
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const marketValueQuery = useMarketValue(portfolioNames);
  const cashFlow = useCashFlow(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);
  const derivedContribution = deriveMonthlyContribution(cashFlow, portfolioAge);
  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    parameters.scenario
  );
  const { data: marketValue, isLoading, isError } = marketValueQuery;
  const hasPortfolios = portfolios.length > 0;
  const planHasPositivePhase = hasPositivePhase(
    parameters.accumulationYears,
    parameters.decumulationYears
  );

  const readiness = resolvePlanReadiness({
    isLoading,
    isMarketValueError: isError,
    marketValue,
    hasPortfolios,
    scenario: scenarioDetails?.params,
  });

  const canSimulate = readiness.status === "ready" && planHasPositivePhase;

  const simulate = () => {
    if (!canSimulate || readiness.status !== "ready") {
      return;
    }

    const result = computeWithdrawalResult({
      parameters: resolvePlanParameters(parameters, derivedContribution),
      startingValue: readiness.startingValue,
      mu: readiness.mu,
      sigma: readiness.sigma,
      cashFlow,
      planStart,
    });

    setSubmitted({
      status: "ready",
      scenario: parameters.scenario,
      result,
    });
  };

  return {
    state: submitted ?? resolveDisplayState(readiness),
    canSimulate,
    planStart,
    derivedContribution,
    simulate,
  };
};

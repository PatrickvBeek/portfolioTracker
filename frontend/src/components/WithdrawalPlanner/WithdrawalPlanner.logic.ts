import {
  ForecastResult,
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
  deriveMonthlyContribution,
} from "../charts/forecastChartUtils";
import {
  ForecastScenario,
  ScenarioDetails,
  getScenarioDetails,
  usePortfolioScenarioParams,
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

export interface WithdrawalResultSummary {
  ruinedCount: number;
  simulationCount: number;
  atRetirement: number;
  atPlanEnd: number;
}

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

export interface WithdrawalPlannerHookResult {
  state: WithdrawalPlannerResultState;
  canSimulate: boolean;
  planStart: number;
  derivedContribution: number | undefined;
  scenarioDetails: ScenarioDetails | undefined;
  isPortfolioScenarioAvailable: boolean;
  simulate: () => void;
}

type PlanReadiness =
  | { status: "loading" }
  | { status: "error" }
  | { status: "unavailable" }
  | { status: "ready"; startingValue: number; gbm: GbmParameters };

const toMonths = (years: number): number => Math.round(years * 12);

const hasPositivePhase = (
  accumulationYears: number,
  decumulationYears: number
): boolean => toMonths(accumulationYears) + toMonths(decumulationYears) > 0;

const resolvePlanReadiness = (input: {
  isLoading: boolean;
  isMarketValueError: boolean;
  marketValue: number | undefined;
  hasPortfolios: boolean;
  gbm: GbmParameters | undefined;
}): PlanReadiness => {
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
  if (!input.hasPortfolios || input.gbm === undefined) {
    return { status: "unavailable" };
  }

  return {
    status: "ready",
    startingValue: input.marketValue,
    gbm: input.gbm,
  };
};

const buildForecastInput = (
  parameters: WithdrawalPlannerParameters,
  startingValue: number,
  gbm: GbmParameters,
  derivedContribution: number | undefined
): WithdrawalForecastInput => ({
  mu: gbm.mu,
  sigma: gbm.sigma,
  startingValue,
  simulationCount: FORECAST_SIMULATION_COUNT,
  accumulationMonths: toMonths(parameters.accumulationYears),
  decumulationMonths: toMonths(parameters.decumulationYears),
  monthlyContribution:
    parameters.monthlyContribution ?? derivedContribution ?? 0,
  monthlyWithdrawal: parameters.monthlyWithdrawal ?? derivedContribution ?? 0,
  annualInflationRate: parameters.inflationRate,
});

const buildBalanceChartData = (
  result: ForecastResult,
  startTimestamp: number
): ForecastChartData =>
  result.median.map((_, index) => ({
    timestamp: addMonths(startTimestamp, index + 1).getTime(),
    median: result.median[index],
    uncertaintyBand: [
      result.confidenceLow[index],
      result.confidenceHigh[index],
    ],
    cashFlow: undefined,
  }));

const buildResult = (
  forecast: WithdrawalForecastResult,
  forecastInput: WithdrawalForecastInput,
  startingValue: number,
  planStart: number
): WithdrawalPlannerResultData => {
  const discounted = applyInflationDiscount(
    forecast,
    forecastInput.annualInflationRate
  );
  const median = discounted.median;
  const atRetirement =
    forecastInput.accumulationMonths === 0
      ? startingValue
      : median[forecastInput.accumulationMonths - 1];

  return {
    summary: {
      ruinedCount: forecast.ruinedCount,
      simulationCount: forecastInput.simulationCount,
      atRetirement,
      atPlanEnd: median[median.length - 1],
    },
    chartData: buildBalanceChartData(discounted, planStart),
  };
};

const computeResult = (
  parameters: WithdrawalPlannerParameters,
  readiness: { startingValue: number; gbm: GbmParameters },
  derivedContribution: number | undefined,
  planStart: number
): WithdrawalPlannerResultData => {
  const forecastInput = buildForecastInput(
    parameters,
    readiness.startingValue,
    readiness.gbm,
    derivedContribution
  );
  const forecast = runWithdrawalForecast(forecastInput, {
    confidencePercentiles: WITHDRAWAL_CONFIDENCE_PERCENTILES,
  });

  return buildResult(
    forecast,
    forecastInput,
    readiness.startingValue,
    planStart
  );
};

const resolveDisplayState = (
  readiness: PlanReadiness
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
  const portfolioScenarioParams = usePortfolioScenarioParams(portfolioNames);
  const scenarioDetails = getScenarioDetails(
    parameters.scenario,
    portfolioScenarioParams
  );
  const { data: marketValue, isLoading, isError } = marketValueQuery;

  const readiness = resolvePlanReadiness({
    isLoading,
    isMarketValueError: isError,
    marketValue,
    hasPortfolios: portfolios.length > 0,
    gbm: scenarioDetails?.params,
  });

  const canSimulate =
    readiness.status === "ready" &&
    hasPositivePhase(
      parameters.accumulationYears,
      parameters.decumulationYears
    );

  const simulate = () => {
    if (!canSimulate || readiness.status !== "ready") {
      return;
    }

    setSubmitted({
      status: "ready",
      scenario: parameters.scenario,
      result: computeResult(
        parameters,
        readiness,
        derivedContribution,
        planStart
      ),
    });
  };

  return {
    state: submitted ?? resolveDisplayState(readiness),
    canSimulate,
    planStart,
    derivedContribution,
    scenarioDetails,
    isPortfolioScenarioAvailable: portfolioScenarioParams !== undefined,
    simulate,
  };
};

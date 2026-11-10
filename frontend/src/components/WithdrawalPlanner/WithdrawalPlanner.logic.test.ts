import { act } from "@testing-library/react";
import {
  getTestPortfolio,
  getTestOrdersGroupedByAsset,
  type WithdrawalForecastResult,
} from "pt-domain";
import { HttpResponse, http } from "msw";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../testUtils/componentHelpers";
import { setUserData } from "../../testUtils/localStorage";
import {
  getPriceResponse,
  mockNetwork,
  resetMockNetwork,
  server,
} from "../../testUtils/networkMock";
import {
  buildPlanDates,
  buildWithdrawalForecastArgs,
  buildWithdrawalPlannerResult,
  buildWithdrawalResultSummary,
  computeWithdrawalResult,
  parseInflationPercent,
  parseMonthlyWithdrawal,
  parseNonNegativeNumber,
  parseYears,
  resolvePlanParameters,
  resolvePlanReadiness,
  useWithdrawalPlanner,
  type ResolvedWithdrawalPlannerParameters,
  type WithdrawalPlanInputs,
  type WithdrawalPlanReadinessInput,
  type WithdrawalPlannerHookResult,
  type WithdrawalPlannerParameters,
  type WithdrawalPlannerResultState,
  yearsToMonths,
} from "./WithdrawalPlanner.logic";

vi.setSystemTime(new Date(2021, 0, 1));

const portfolioName = "testPortfolio";
const portfolio = getTestPortfolio({
  name: portfolioName,
  orders: getTestOrdersGroupedByAsset([
    {
      asset: "ABC",
      timestamp: "2020-01-01",
      sharePrice: 100,
      pieces: 100,
      orderFee: 0,
      taxes: 0,
    },
  ]),
});

const assets = {
  ABC: {
    displayName: "ABC Corp",
    isin: "ABC",
    symbol: "ABC",
  },
};

setUserData({
  portfolios: { [portfolioName]: portfolio },
  assets,
});

mockNetwork({
  prices: getPriceResponse("ABC", [
    [new Date("2020-01-01"), 100],
    [new Date("2020-02-01"), 110],
  ]),
});

const baseParameters: WithdrawalPlannerParameters = {
  scenario: "market",
  accumulationYears: 1,
  decumulationYears: 1,
  monthlyContribution: null,
  monthlyWithdrawal: null,
  inflationRate: 0,
};

const resolvedBaseParameters: ResolvedWithdrawalPlannerParameters = {
  ...baseParameters,
  monthlyContribution: 850,
  monthlyWithdrawal: 850,
};

const renderPlanner = (parameters: WithdrawalPlannerParameters) =>
  customRenderHook(() => useWithdrawalPlanner([portfolioName], parameters));

const waitForSimulationReady = (result: {
  current: WithdrawalPlannerHookResult;
}) => customWaitFor(() => expect(result.current.canSimulate).toBe(true));

const simulate = (result: { current: WithdrawalPlannerHookResult }) => {
  act(() => result.current.simulate());
};

const resultOf = (state: WithdrawalPlannerResultState) =>
  state.status === "ready" ? state.result : undefined;

const buildArgs = (
  overrides: Partial<ResolvedWithdrawalPlannerParameters> = {}
) =>
  buildWithdrawalForecastArgs({
    parameters: { ...resolvedBaseParameters, ...overrides },
    startingValue: 100_000,
    gbmParams: { mu: 0.01, sigma: 0.05 },
  });

describe("useWithdrawalPlanner", () => {
  it("stays idle until the user simulates", async () => {
    const { result } = renderPlanner(baseParameters);

    expect(result.current.state).toEqual({ status: "idle" });

    await waitForSimulationReady(result);

    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("returns chart data for the whole plan horizon after submit", async () => {
    const { result } = renderPlanner(baseParameters);
    await waitForSimulationReady(result);
    simulate(result);

    const data = resultOf(result.current.state);
    expect(data?.chartData).toHaveLength(24);
    expect(data?.summary.ruinedCount).toBe(0);
    expect(data?.summary.atPlanEnd).toBe(data?.chartData.at(-1)?.median);
  });

  it("fixes the plan start and ends the chart at the calendar plan end", async () => {
    const { result } = renderPlanner(baseParameters);
    await waitForSimulationReady(result);
    simulate(result);

    expect(result.current.planStart).toBe(new Date(2021, 0, 1).getTime());
    const lastPoint = resultOf(result.current.state)?.chartData.at(-1);
    expect(new Date(lastPoint?.timestamp ?? 0)).toEqual(new Date(2023, 0, 1));
  });

  it("derives the automatic monthly contribution from cash flow", async () => {
    const { result } = renderPlanner(baseParameters);

    expect(result.current.derivedContribution).toBe(850);

    await waitForSimulationReady(result);
  });

  it("uses an explicit monthly contribution in the simulation", async () => {
    const { result } = renderPlanner({
      ...baseParameters,
      monthlyContribution: 1_000_000,
    });
    await waitForSimulationReady(result);
    simulate(result);

    expect(resultOf(result.current.state)?.chartData[0].median).toBeGreaterThan(
      500_000
    );
  });

  it("reports certain ruin when the withdrawal exceeds the balance", async () => {
    const { result } = renderPlanner({
      ...baseParameters,
      monthlyWithdrawal: 1_000_000,
    });
    await waitForSimulationReady(result);
    simulate(result);

    const summary = resultOf(result.current.state)?.summary;
    expect(summary?.ruinedCount).toBe(summary?.simulationCount);
  });

  it("does not recompute when parameters change", async () => {
    let parameters = baseParameters;
    const { result, rerender } = customRenderHook(() =>
      useWithdrawalPlanner([portfolioName], parameters)
    );
    await waitForSimulationReady(result);
    simulate(result);

    const ready = result.current.state;

    parameters = { ...baseParameters, monthlyWithdrawal: 100 };
    rerender();

    expect(result.current.state).toBe(ready);
    expect(result.current.canSimulate).toBe(true);
  });

  it("keeps the displayed result when prices refetch", async () => {
    const { result, queryClient } = customRenderHook(() =>
      useWithdrawalPlanner([portfolioName], baseParameters)
    );
    await waitForSimulationReady(result);
    simulate(result);

    const ready = result.current.state;

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ["prices"] });
    });

    expect(result.current.state).toBe(ready);
  });

  it("snapshots the scenario with the submitted result", async () => {
    let parameters: WithdrawalPlannerParameters = {
      ...baseParameters,
      scenario: "market",
    };
    const { result, rerender } = customRenderHook(() =>
      useWithdrawalPlanner([portfolioName], parameters)
    );
    await waitForSimulationReady(result);
    simulate(result);

    const ready = result.current.state;
    if (ready.status !== "ready") {
      throw new Error("expected ready");
    }
    expect(ready.scenario).toBe("market");

    parameters = { ...baseParameters, scenario: "portfolio" };
    rerender();
    await waitForSimulationReady(result);

    expect(result.current.state).toBe(ready);

    simulate(result);

    const settled = result.current.state;
    if (settled.status !== "ready") {
      throw new Error("expected ready");
    }
    expect(settled.scenario).toBe("portfolio");
  });

  it("does not allow simulation without a positive phase", async () => {
    const { result, queryClient } = customRenderHook(() =>
      useWithdrawalPlanner([portfolioName], {
        ...baseParameters,
        accumulationYears: 0,
        decumulationYears: 0,
      })
    );
    await customWaitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.canSimulate).toBe(false);
  });

  it("reports unavailable for an unknown portfolio", () => {
    const { result } = customRenderHook(() =>
      useWithdrawalPlanner(["unknown"], baseParameters)
    );

    expect(result.current.state).toEqual({ status: "unavailable" });
    expect(result.current.canSimulate).toBe(false);
  });

  it("reports a market value error when prices cannot be loaded", async () => {
    server.use(
      http.get(
        "https://www.alphavantage.co/query",
        () => new HttpResponse(null, { status: 500 })
      )
    );

    try {
      const { result } = customRenderHook(() =>
        useWithdrawalPlanner([portfolioName], baseParameters)
      );
      await customWaitFor(() =>
        expect(result.current.state.status).toBe("error")
      );

      expect(result.current.state).toEqual({ status: "error" });
      expect(result.current.canSimulate).toBe(false);
    } finally {
      resetMockNetwork();
    }
  });
});

describe("input parsing", () => {
  it("parses whole years and truncates decimals", () => {
    expect(parseYears("0")).toBe(0);
    expect(parseYears("10")).toBe(10);
    expect(parseYears("5.9")).toBe(5);
  });

  it("clamps years to the allowed range", () => {
    expect(parseYears("60")).toBe(60);
    expect(parseYears("61")).toBe(60);
    expect(parseYears("-1")).toBe(0);
    expect(parseYears("NaN")).toBe(0);
    expect(parseYears("abc")).toBe(0);
  });

  it("clamps negative decimals to zero", () => {
    expect(parseNonNegativeNumber("-2.5")).toBe(0);
    expect(parseNonNegativeNumber("2000.5")).toBe(2000.5);
  });

  it("clamps the monthly withdrawal to the maximum", () => {
    expect(parseMonthlyWithdrawal("10000")).toBe(10_000);
    expect(parseMonthlyWithdrawal("10001")).toBe(10_000);
    expect(parseMonthlyWithdrawal("-1")).toBe(0);
    expect(parseMonthlyWithdrawal("abc")).toBe(0);
  });

  it("parses inflation percentages as fractions within the allowed range", () => {
    expect(parseInflationPercent("2.5")).toBe(0.025);
    expect(parseInflationPercent("25")).toBe(0.2);
    expect(parseInflationPercent("-1")).toBe(0);
  });
});

describe("yearsToMonths", () => {
  it("converts whole years to engine months", () => {
    expect(yearsToMonths(0)).toBe(0);
    expect(yearsToMonths(1)).toBe(12);
    expect(yearsToMonths(10)).toBe(120);
    expect(yearsToMonths(60)).toBe(720);
  });

  it("keeps the raw conversion for out-of-range and invalid values", () => {
    expect(yearsToMonths(61)).toBe(732);
    expect(yearsToMonths(-1)).toBe(-12);
    expect(yearsToMonths(NaN)).toBeNaN();
  });
});

describe("buildPlanDates", () => {
  const planStart = new Date(2021, 0, 1).getTime();

  it("labels both phases when they are positive", () => {
    expect(buildPlanDates(planStart, 10, 20)).toEqual({
      retirementLabel: "Retire around January 2031",
      planEndLabel: "Plan ends around January 2051",
    });
  });

  it("labels zero accumulation as retiring now", () => {
    expect(buildPlanDates(planStart, 0, 20)).toEqual({
      retirementLabel: "Retire now",
      planEndLabel: "Plan ends around January 2041",
    });
  });

  it("labels zero decumulation as no withdrawal phase", () => {
    expect(buildPlanDates(planStart, 10, 0)).toEqual({
      retirementLabel: "Retire around January 2031",
      planEndLabel: "No withdrawal phase",
    });
  });
});

describe("resolvePlanParameters", () => {
  it("uses the derived contribution for both amounts when automatic", () => {
    expect(resolvePlanParameters(baseParameters, 850)).toMatchObject({
      monthlyContribution: 850,
      monthlyWithdrawal: 850,
    });
  });

  it("prefers explicit amounts over the derived contribution", () => {
    expect(
      resolvePlanParameters(
        {
          ...baseParameters,
          monthlyContribution: 500,
          monthlyWithdrawal: 2_000,
        },
        850
      )
    ).toMatchObject({
      monthlyContribution: 500,
      monthlyWithdrawal: 2_000,
    });
  });

  it("keeps an explicit zero amount", () => {
    expect(
      resolvePlanParameters(
        { ...baseParameters, monthlyContribution: 0, monthlyWithdrawal: 0 },
        850
      )
    ).toMatchObject({
      monthlyContribution: 0,
      monthlyWithdrawal: 0,
    });
  });

  it("uses zero when amounts and derived contribution are unavailable", () => {
    expect(resolvePlanParameters(baseParameters, undefined)).toMatchObject({
      monthlyContribution: 0,
      monthlyWithdrawal: 0,
    });
  });
});

describe("buildWithdrawalForecastArgs", () => {
  it("passes the selected inflation rate to the forecast", () => {
    expect(buildArgs({ inflationRate: 0.03 }).annualInflationRate).toBe(0.03);
  });

  it("converts whole years to accumulation and decumulation months", () => {
    const input = buildArgs({
      accumulationYears: 10,
      decumulationYears: 20,
    });

    expect(input.accumulationMonths).toBe(120);
    expect(input.decumulationMonths).toBe(240);
  });

  it("passes the resolved monthly amounts to the forecast", () => {
    const input = buildArgs({
      monthlyContribution: 500,
      monthlyWithdrawal: 2_000,
    });

    expect(input.monthlyContribution).toBe(500);
    expect(input.monthlyWithdrawal).toBe(2_000);
  });
});

describe("buildWithdrawalResultSummary", () => {
  const median = [110, 120, 130];

  it("reads the value at retirement from the accumulation end", () => {
    const summary = buildWithdrawalResultSummary({
      ruinedCount: 50,
      simulationCount: 1000,
      accumulationMonths: 2,
      startingValue: 100,
      median,
    });

    expect(summary.atRetirement).toBe(120);
    expect(summary.atPlanEnd).toBe(130);
  });

  it("indexes the retirement and plan-end medians directly", () => {
    const summary = buildWithdrawalResultSummary({
      ruinedCount: 50,
      simulationCount: 1000,
      accumulationMonths: 3,
      startingValue: 100,
      median: [90, 95, 70, 40, 10],
    });

    expect(summary.atRetirement).toBe(70);
    expect(summary.atPlanEnd).toBe(10);
  });

  it("uses the starting value when there is no accumulation phase", () => {
    const summary = buildWithdrawalResultSummary({
      ruinedCount: 0,
      simulationCount: 1000,
      accumulationMonths: 0,
      startingValue: 100,
      median,
    });

    expect(summary.atRetirement).toBe(100);
  });

  it("keeps the simulation counts as facts", () => {
    const summary = buildWithdrawalResultSummary({
      ruinedCount: 123,
      simulationCount: 1000,
      accumulationMonths: 1,
      startingValue: 100,
      median,
    });

    expect(summary.ruinedCount).toBe(123);
    expect(summary.simulationCount).toBe(1000);
  });

  it("flags a median that rounds to zero", () => {
    const ruined = buildWithdrawalResultSummary({
      ruinedCount: 900,
      simulationCount: 1000,
      accumulationMonths: 1,
      startingValue: 100,
      median: [110, 0.4],
    });

    expect(ruined.isMedianRuined).toBe(true);

    const surviving = buildWithdrawalResultSummary({
      ruinedCount: 900,
      simulationCount: 1000,
      accumulationMonths: 1,
      startingValue: 100,
      median: [110, 1],
    });

    expect(surviving.isMedianRuined).toBe(false);
  });
});

const buildReadinessInput = (
  overrides: Partial<WithdrawalPlanReadinessInput> = {}
): WithdrawalPlanReadinessInput => ({
  isLoading: false,
  isMarketValueError: false,
  marketValue: 100_000,
  hasPortfolios: true,
  scenario: { mu: 0.01, sigma: 0.05 },
  ...overrides,
});

describe("resolvePlanReadiness", () => {
  it("reports loading while the market value loads", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ isLoading: true }))
    ).toEqual({ status: "loading" });
  });

  it("reports a market value error for a failed price query", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ isMarketValueError: true }))
    ).toEqual({ status: "error" });
  });

  it("reports a market value error for a missing or non-finite value", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ marketValue: undefined }))
    ).toEqual({ status: "error" });
    expect(
      resolvePlanReadiness(buildReadinessInput({ marketValue: NaN }))
    ).toEqual({ status: "error" });
  });

  it("reports unavailable without portfolios or scenario parameters", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ hasPortfolios: false }))
    ).toEqual({ status: "unavailable" });
    expect(
      resolvePlanReadiness(buildReadinessInput({ scenario: undefined }))
    ).toEqual({ status: "unavailable" });
  });

  it("carries primitives for a ready plan", () => {
    expect(resolvePlanReadiness(buildReadinessInput())).toEqual({
      status: "ready",
      startingValue: 100_000,
      mu: 0.01,
      sigma: 0.05,
    });
  });
});

const buildComputeInputs = (
  overrides: Partial<WithdrawalPlanInputs> = {}
): WithdrawalPlanInputs => ({
  parameters: resolvedBaseParameters,
  startingValue: 100_000,
  mu: 0.01,
  sigma: 0.05,
  cashFlow: 0,
  planStart: new Date(2021, 0, 1).getTime(),
  ...overrides,
});

const buildForecast = (
  ruinProbability: number,
  median: number[]
): WithdrawalForecastResult => ({
  median,
  confidenceLow: [...median],
  confidenceHigh: [...median],
  cashFlows: median.map(() => 0),
  ruinProbability,
  ruinedCount: Math.round(ruinProbability * 1000),
});

describe("buildWithdrawalPlannerResult", () => {
  it("expresses both metrics in today's money", () => {
    const nominalMedian = Array.from({ length: 24 }, () => 1000);
    const result = buildWithdrawalPlannerResult(
      buildForecast(0, nominalMedian),
      buildArgs(),
      buildComputeInputs({
        parameters: { ...resolvedBaseParameters, inflationRate: 0.02 },
      })
    );

    expect(result.summary.atRetirement).toBeCloseTo(1000 / 1.02, 6);
    expect(result.summary.atPlanEnd).toBeCloseTo(1000 / 1.02 ** 2, 6);
  });
});

describe("computeWithdrawalResult", () => {
  it("returns a summary and chart data for the whole plan", () => {
    const result = computeWithdrawalResult(buildComputeInputs());

    expect(result.chartData).toHaveLength(24);
    expect(result.summary.simulationCount).toBe(1000);
    expect(result.summary.atPlanEnd).toBe(result.chartData.at(-1)?.median);
  });

  it("reports certain ruin when the withdrawal exceeds the balance", () => {
    const result = computeWithdrawalResult(
      buildComputeInputs({
        parameters: { ...resolvedBaseParameters, monthlyWithdrawal: 1_000_000 },
      })
    );

    expect(result.summary.ruinedCount).toBe(result.summary.simulationCount);
  });
});

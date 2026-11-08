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
  buildWithdrawalResultSummary,
  computeWithdrawalResult,
  parseInflationPercent,
  parseMonthlyWithdrawal,
  parseNonNegativeNumber,
  parseYears,
  resolvePlanReadiness,
  resolveWithdrawalPlannerState,
  useDerivedMonthlyContribution,
  useWithdrawalPlannerData,
  WITHDRAWAL_CONFIDENCE_PERCENT,
  WITHDRAWAL_CONFIDENCE_PERCENTILES,
  type WithdrawalPlanComputation,
  type WithdrawalPlanInputs,
  type WithdrawalPlanReadiness,
  type WithdrawalPlanReadinessInput,
  type WithdrawalPlannerResultState,
  WithdrawalPlannerParameters,
  yearsToMonths,
} from "./WithdrawalPlanner.logic";
import { getTestWithdrawalSummary } from "../../testUtils/withdrawalPlannerHelpers";

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

const renderPlanner = (parameters: WithdrawalPlannerParameters) => {
  const { result } = customRenderHook(() =>
    useWithdrawalPlannerData([portfolioName], parameters)
  );
  return result;
};

const resultOf = (state: WithdrawalPlannerResultState) =>
  state.status === "ready" || state.status === "updating"
    ? state.result
    : undefined;

const buildArgs = (
  parameters: WithdrawalPlannerParameters,
  derivedContribution: number | undefined
) =>
  buildWithdrawalForecastArgs({
    parameters,
    startingValue: 100_000,
    derivedContribution,
    gbmParams: { mu: 0.01, sigma: 0.05 },
  });

describe("useWithdrawalPlannerData", () => {
  it("returns chart data for the whole plan horizon", async () => {
    const result = renderPlanner(baseParameters);
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    const data = resultOf(result.current.state);
    expect(data?.chartData).toHaveLength(24);
    expect(data?.summary.ruinedCount).toBe(0);
    expect(data?.summary.atPlanEnd).toBe(data?.chartData.at(-1)?.median);
  });

  it("fixes the plan start and ends the chart at the calendar plan end", async () => {
    const result = renderPlanner(baseParameters);
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    expect(result.current.planStart).toBe(new Date(2021, 0, 1).getTime());
    const lastPoint = resultOf(result.current.state)?.chartData.at(-1);
    expect(new Date(lastPoint?.timestamp ?? 0)).toEqual(new Date(2023, 0, 1));
  });

  it("uses an explicit monthly contribution in the simulation", async () => {
    const result = renderPlanner({
      ...baseParameters,
      monthlyContribution: 1_000_000,
    });
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    expect(resultOf(result.current.state)?.chartData[0].median).toBeGreaterThan(
      500_000
    );
  });

  it("reports certain ruin when the withdrawal exceeds the balance", async () => {
    const result = renderPlanner({
      ...baseParameters,
      monthlyWithdrawal: 1_000_000,
    });
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    const summary = resultOf(result.current.state)?.summary;
    expect(summary?.ruinedCount).toBe(summary?.simulationCount);
  });

  it("reports unavailable when both phases are zero", async () => {
    const { result, queryClient } = customRenderHook(() =>
      useWithdrawalPlannerData([portfolioName], {
        ...baseParameters,
        accumulationYears: 0,
        decumulationYears: 0,
      })
    );
    await customWaitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(result.current.state.status).toBe("unavailable");
  });

  it("reports unavailable for an unknown portfolio", () => {
    const { result } = customRenderHook(() =>
      useWithdrawalPlannerData(["unknown"], baseParameters)
    );

    expect(result.current.state.status).toBe("unavailable");
  });

  it("keeps the previous result object while the debounce is pending", async () => {
    let parameters = baseParameters;
    const { result, rerender } = customRenderHook(() =>
      useWithdrawalPlannerData([portfolioName], parameters)
    );
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    const ready = result.current.state;
    if (ready.status !== "ready") {
      throw new Error("expected ready");
    }

    parameters = { ...baseParameters, monthlyWithdrawal: 100 };
    rerender();

    const pending = result.current.state;
    expect(pending.status).toBe("updating");
    if (pending.status !== "updating") {
      return;
    }

    expect(pending.result).toBe(ready.result);

    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );
  });

  it("keeps the scenario snapshot in step with the displayed result", async () => {
    let parameters: WithdrawalPlannerParameters = {
      ...baseParameters,
      scenario: "market",
    };
    const { result, rerender } = customRenderHook(() =>
      useWithdrawalPlannerData([portfolioName], parameters)
    );
    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    const ready = result.current.state;
    if (ready.status !== "ready") {
      throw new Error("expected ready");
    }
    expect(ready.result.scenario).toBe("market");

    parameters = { ...baseParameters, scenario: "portfolio" };
    rerender();

    const pending = result.current.state;
    expect(pending.status).toBe("updating");
    if (pending.status !== "updating") {
      return;
    }
    expect(pending.result).toBe(ready.result);
    expect(pending.result.scenario).toBe("market");

    await customWaitFor(() =>
      expect(result.current.state.status).toBe("ready")
    );

    const settled = result.current.state;
    if (settled.status !== "ready") {
      throw new Error("expected ready");
    }
    expect(settled.result.scenario).toBe("portfolio");
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
        useWithdrawalPlannerData([portfolioName], baseParameters)
      );
      await customWaitFor(() =>
        expect(result.current.state.status).toBe("error")
      );

      expect(result.current.state).toEqual({
        status: "error",
        kind: "marketValue",
      });
    } finally {
      resetMockNetwork();
    }
  });
});

describe("useDerivedMonthlyContribution", () => {
  it("derives the monthly contribution from cash flow and portfolio age", () => {
    const { result } = customRenderHook(() =>
      useDerivedMonthlyContribution([portfolioName])
    );

    expect(result.current).toBe(850);
  });

  it("returns undefined when there is no usable history", () => {
    const { result } = customRenderHook(() =>
      useDerivedMonthlyContribution(["unknown"])
    );

    expect(result.current).toBeUndefined();
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

describe("buildWithdrawalForecastArgs", () => {
  it("passes the selected inflation rate to the forecast", () => {
    const input = buildArgs({ ...baseParameters, inflationRate: 0.03 }, 850);

    expect(input.annualInflationRate).toBe(0.03);
  });

  it("converts whole years to accumulation and decumulation months", () => {
    const input = buildArgs(
      {
        ...baseParameters,
        accumulationYears: 10,
        decumulationYears: 20,
      },
      850
    );

    expect(input.accumulationMonths).toBe(120);
    expect(input.decumulationMonths).toBe(240);
  });

  it("uses the derived contribution for both amounts when automatic", () => {
    const input = buildArgs(baseParameters, 850);

    expect(input.monthlyContribution).toBe(850);
    expect(input.monthlyWithdrawal).toBe(850);
  });

  it("prefers explicit amounts over the derived contribution", () => {
    const input = buildArgs(
      {
        ...baseParameters,
        monthlyContribution: 500,
        monthlyWithdrawal: 2_000,
      },
      850
    );

    expect(input.monthlyContribution).toBe(500);
    expect(input.monthlyWithdrawal).toBe(2_000);
  });

  it("keeps an explicit zero amount", () => {
    const input = buildArgs(
      { ...baseParameters, monthlyContribution: 0, monthlyWithdrawal: 0 },
      850
    );

    expect(input.monthlyContribution).toBe(0);
    expect(input.monthlyWithdrawal).toBe(0);
  });

  it("uses zero when amounts and derived contribution are unavailable", () => {
    const input = buildArgs(baseParameters, undefined);

    expect(input.monthlyContribution).toBe(0);
    expect(input.monthlyWithdrawal).toBe(0);
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

const buildForecast = (
  ruinProbability: number,
  median: number[] = [100, 110, 120, 130]
): WithdrawalForecastResult => ({
  median,
  confidenceLow: [...median],
  confidenceHigh: [...median],
  cashFlows: median.map(() => 0),
  ruinProbability,
});

const buildReadinessInput = (
  overrides: Partial<WithdrawalPlanReadinessInput> = {}
): WithdrawalPlanReadinessInput => ({
  hasPositivePhase: true,
  waitingForFreshPlan: false,
  isLoading: false,
  isMarketValueError: false,
  marketValue: 100_000,
  hasPortfolios: true,
  scenario: { mu: 0.01, sigma: 0.05 },
  ...overrides,
});

describe("resolvePlanReadiness", () => {
  it("prioritizes a fresh plan over the other readiness signals", () => {
    expect(
      resolvePlanReadiness(
        buildReadinessInput({
          waitingForFreshPlan: true,
          hasPositivePhase: false,
          isLoading: true,
          isMarketValueError: true,
        })
      )
    ).toEqual({ status: "loading" });
  });

  it("reports unavailable when the plan has no positive phase", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ hasPositivePhase: false }))
    ).toEqual({ status: "unavailable" });
  });

  it("reports loading while the market value loads", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ isLoading: true }))
    ).toEqual({ status: "loading" });
  });

  it("reports a market value error for a failed price query", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ isMarketValueError: true }))
    ).toEqual({ status: "error", kind: "marketValue" });
  });

  it("reports a market value error for a missing or non-finite value", () => {
    expect(
      resolvePlanReadiness(buildReadinessInput({ marketValue: undefined }))
    ).toEqual({ status: "error", kind: "marketValue" });
    expect(
      resolvePlanReadiness(buildReadinessInput({ marketValue: NaN }))
    ).toEqual({ status: "error", kind: "marketValue" });
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

const readyReadiness: WithdrawalPlanReadiness = {
  status: "ready",
  startingValue: 100_000,
  mu: 0.01,
  sigma: 0.05,
};

const computedResult = {
  scenario: "market" as const,
  summary: getTestWithdrawalSummary(),
  chartData: [],
};

const computed: WithdrawalPlanComputation = {
  status: "computed",
  result: computedResult,
};

describe("resolveWithdrawalPlannerState", () => {
  it("passes through a non-ready readiness before the computation", () => {
    expect(
      resolveWithdrawalPlannerState(
        { status: "loading" },
        { status: "failed" },
        false
      )
    ).toEqual({ status: "loading" });
    expect(
      resolveWithdrawalPlannerState(
        { status: "error", kind: "marketValue" },
        computed,
        false
      )
    ).toEqual({ status: "error", kind: "marketValue" });
    expect(
      resolveWithdrawalPlannerState({ status: "unavailable" }, computed, false)
    ).toEqual({ status: "unavailable" });
  });

  it("maps a failed computation to a calculation error", () => {
    expect(
      resolveWithdrawalPlannerState(readyReadiness, { status: "failed" }, false)
    ).toEqual({ status: "error", kind: "calculation" });
  });

  it("reports loading while the computation is idle", () => {
    expect(
      resolveWithdrawalPlannerState(readyReadiness, { status: "idle" }, false)
    ).toEqual({ status: "loading" });
  });

  it("reports the computed result as ready or updating", () => {
    expect(
      resolveWithdrawalPlannerState(readyReadiness, computed, false)
    ).toEqual({ status: "ready", result: computedResult });
    expect(
      resolveWithdrawalPlannerState(readyReadiness, computed, true)
    ).toEqual({ status: "updating", result: computedResult });
  });

  it("keeps the same result reference while updating", () => {
    const updating = resolveWithdrawalPlannerState(
      readyReadiness,
      computed,
      true
    );

    expect(updating).toMatchObject({ status: "updating" });
    if (updating.status !== "updating") {
      return;
    }

    expect(updating.result).toBe(computedResult);
  });
});

const buildComputeInputs = (
  overrides: Partial<WithdrawalPlanInputs> = {}
): WithdrawalPlanInputs => ({
  parameters: baseParameters,
  startingValue: 100_000,
  mu: 0.01,
  sigma: 0.05,
  derivedContribution: undefined,
  cashFlow: 0,
  planStart: new Date(2021, 0, 1).getTime(),
  confidencePercentiles: [5, 95],
  ...overrides,
});

describe("computeWithdrawalResult", () => {
  it("computes the result from the injected simulation", () => {
    let receivedConfig: { confidencePercentiles: [number, number] } | undefined;
    const median = Array.from({ length: 24 }, (_, index) => 100 + index);

    const computation = computeWithdrawalResult(
      buildComputeInputs(),
      (input, config) => {
        expect(input.startingValue).toBe(100_000);
        expect(input.mu).toBe(0.01);
        expect(input.sigma).toBe(0.05);
        receivedConfig = config;
        return buildForecast(0.1, median);
      }
    );

    expect(receivedConfig).toEqual({ confidencePercentiles: [5, 95] });
    expect(computation.status).toBe("computed");
    if (computation.status !== "computed") {
      return;
    }

    expect(computation.result.scenario).toBe("market");
    expect(computation.result.chartData).toHaveLength(median.length);
    expect(computation.result.summary).toMatchObject({
      ruinedCount: 100,
      simulationCount: 1000,
      atRetirement: 111,
      atPlanEnd: 123,
    });
  });

  it("expresses both metrics in today's money", () => {
    const nominalMedian = Array.from({ length: 24 }, () => 1000);

    const computation = computeWithdrawalResult(
      buildComputeInputs({
        parameters: { ...baseParameters, inflationRate: 0.02 },
      }),
      () => buildForecast(0, nominalMedian)
    );

    if (computation.status !== "computed") {
      throw new Error("expected a computed result");
    }

    expect(computation.result.summary.atRetirement).toBeCloseTo(1000 / 1.02, 6);
    expect(computation.result.summary.atPlanEnd).toBeCloseTo(
      1000 / 1.02 ** 2,
      6
    );
  });

  it("logs a simulation failure once and reports failed", () => {
    const error = new Error("forecast failed");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      expect(
        computeWithdrawalResult(buildComputeInputs(), () => {
          throw error;
        })
      ).toEqual({ status: "failed" });
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        "Withdrawal forecast simulation failed",
        error
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it("does not swallow defects outside the simulation", () => {
    const brokenForecast = buildForecast(0);
    Object.defineProperty(brokenForecast, "median", { value: 0 });
    let outcome: WithdrawalPlanComputation | undefined;

    expect(() => {
      outcome = computeWithdrawalResult(
        buildComputeInputs(),
        () => brokenForecast
      );
    }).toThrow(/./);
    expect(outcome).toBeUndefined();
  });
});

describe("WITHDRAWAL_CONFIDENCE_PERCENTILES", () => {
  it("matches the confidence percent used in the label", () => {
    expect(WITHDRAWAL_CONFIDENCE_PERCENTILES).toEqual([
      50 - WITHDRAWAL_CONFIDENCE_PERCENT / 2,
      50 + WITHDRAWAL_CONFIDENCE_PERCENT / 2,
    ]);
  });
});

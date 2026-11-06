import {
  getTestPortfolio,
  getTestOrdersGroupedByAsset,
  runWithdrawalForecast,
} from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../testUtils/componentHelpers";
import { setUserData } from "../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../testUtils/networkMock";
import {
  buildPlanDates,
  buildWithdrawalForecastArgs,
  parseInflationPercent,
  parseMonthlyWithdrawal,
  parseNonNegativeNumber,
  parseYears,
  useDerivedMonthlyContribution,
  useWithdrawalPlannerData,
  WITHDRAWAL_CONFIDENCE_PERCENT,
  WITHDRAWAL_CONFIDENCE_PERCENTILES,
  WithdrawalPlannerParameters,
  yearsToMonths,
} from "./WithdrawalPlanner.logic";

type PtDomainModule = Record<string, unknown> & {
  runWithdrawalForecast: typeof runWithdrawalForecast;
};

vi.mock("pt-domain", async (importOriginal) => {
  const actual = await importOriginal<PtDomainModule>();
  return {
    ...actual,
    runWithdrawalForecast: vi.fn<typeof runWithdrawalForecast>(
      actual.runWithdrawalForecast
    ),
  };
});

vi.setSystemTime(new Date(2021, 0, 1));

const runWithdrawalForecastMock = vi.mocked(runWithdrawalForecast);

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
  prices: getPriceResponse("ABC", [[new Date("2020-01-01"), 100]]),
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
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.chartData).toHaveLength(24);
    expect(result.current.data?.ruinProbability).toBe(0);
    expect(result.current.isError).toBe(false);
  });

  it("fixes the plan start and ends the chart at the calendar plan end", async () => {
    const result = renderPlanner(baseParameters);
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.planStart).toBe(new Date(2021, 0, 1).getTime());
    const lastPoint = result.current.data?.chartData.at(-1);
    expect(new Date(lastPoint?.timestamp ?? 0)).toEqual(new Date(2023, 0, 1));
  });

  it("uses an explicit monthly contribution in the simulation", async () => {
    const result = renderPlanner({
      ...baseParameters,
      monthlyContribution: 1_000_000,
    });
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.chartData[0].median).toBeGreaterThan(500_000);
  });

  it("reports certain ruin when the withdrawal exceeds the balance", async () => {
    const result = renderPlanner({
      ...baseParameters,
      monthlyWithdrawal: 1_000_000,
    });
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.ruinProbability).toBe(1);
  });

  it("returns no data and skips the simulation when both phases are zero", async () => {
    runWithdrawalForecastMock.mockClear();

    const { result, queryClient } = customRenderHook(() =>
      useWithdrawalPlannerData([portfolioName], {
        ...baseParameters,
        accumulationYears: 0,
        decumulationYears: 0,
      })
    );
    await customWaitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(runWithdrawalForecastMock).not.toHaveBeenCalled();
  });

  it("returns no data for an unknown portfolio", () => {
    const { result } = customRenderHook(() =>
      useWithdrawalPlannerData(["unknown"], baseParameters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
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

describe("WITHDRAWAL_CONFIDENCE_PERCENTILES", () => {
  it("matches the confidence percent used in the label", () => {
    expect(WITHDRAWAL_CONFIDENCE_PERCENTILES).toEqual([
      50 - WITHDRAWAL_CONFIDENCE_PERCENT / 2,
      50 + WITHDRAWAL_CONFIDENCE_PERCENT / 2,
    ]);
  });
});

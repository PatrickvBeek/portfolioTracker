import { getTestPortfolio, getTestOrdersGroupedByAsset } from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../testUtils/componentHelpers";
import { setUserData } from "../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../testUtils/networkMock";
import {
  buildWithdrawalForecastArgs,
  parseInflationPercent,
  parseNonNegativeInt,
  parseNonNegativeNumber,
  useWithdrawalPlannerData,
  WithdrawalPlannerParameters,
} from "./WithdrawalPlanner.logic";

vi.setSystemTime("2021-01-01");

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
  accumulationMonths: 0,
  decumulationYears: 1,
  decumulationMonths: 0,
  monthlyContribution: null,
  monthlyWithdrawal: 0,
  inflationRate: 0,
};

const renderPlanner = (parameters: WithdrawalPlannerParameters) => {
  const { result } = customRenderHook(() =>
    useWithdrawalPlannerData([portfolioName], parameters)
  );
  return result;
};

describe("useWithdrawalPlannerData", () => {
  it("returns chart data for the whole plan horizon", async () => {
    const result = renderPlanner(baseParameters);
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.chartData).toHaveLength(24);
    expect(result.current.data?.ruinProbability).toBe(0);
    expect(result.current.isError).toBe(false);
  });

  it("derives the monthly contribution from cash flow and portfolio age", async () => {
    const result = renderPlanner(baseParameters);
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.monthlyContribution).toBe(850);
  });

  it("uses an explicit monthly contribution in the simulation", async () => {
    const result = renderPlanner({
      ...baseParameters,
      monthlyContribution: 1_000_000,
    });
    await customWaitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.monthlyContribution).toBe(1_000_000);
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

  it("returns no data for an unknown portfolio", () => {
    const { result } = customRenderHook(() =>
      useWithdrawalPlannerData(["unknown"], baseParameters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe("input parsing", () => {
  it("clamps negative integers to zero", () => {
    expect(parseNonNegativeInt("-5")).toBe(0);
    expect(parseNonNegativeInt("12")).toBe(12);
  });

  it("clamps negative decimals to zero", () => {
    expect(parseNonNegativeNumber("-2.5")).toBe(0);
    expect(parseNonNegativeNumber("2000.5")).toBe(2000.5);
  });

  it("parses inflation percentages as fractions within the allowed range", () => {
    expect(parseInflationPercent("2.5")).toBe(0.025);
    expect(parseInflationPercent("25")).toBe(0.2);
    expect(parseInflationPercent("-1")).toBe(0);
  });
});

describe("buildWithdrawalForecastArgs", () => {
  it("passes the selected inflation rate to the forecast and the display", () => {
    const args = buildWithdrawalForecastArgs({
      parameters: { ...baseParameters, inflationRate: 0.03 },
      startingValue: 100_000,
      monthlyContribution: 500,
      currentCashFlow: 0,
      gbmParams: { mu: 0.01, sigma: 0.05 },
      startTimestamp: 0,
    });

    expect(args.input.annualInflationRate).toBe(0.03);
    expect(args.inflationRate).toBe(0.03);
  });
});

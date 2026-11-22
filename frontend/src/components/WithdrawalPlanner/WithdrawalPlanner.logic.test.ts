import { act } from "@testing-library/react";
import { getTestPortfolio, getTestOrdersGroupedByAsset } from "pt-domain";
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
  useWithdrawalPlanner,
  type WithdrawalPlannerHookResult,
  type WithdrawalPlannerParameters,
  type WithdrawalPlannerResultState,
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

setUserData({
  portfolios: { [portfolioName]: portfolio },
  assets: {
    ABC: { displayName: "ABC Corp", isin: "ABC", symbol: "ABC" },
  },
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

  it("exposes the selected scenario and portfolio availability", async () => {
    const { result } = renderPlanner({
      ...baseParameters,
      scenario: "portfolio",
    });
    await waitForSimulationReady(result);

    expect(result.current.isPortfolioScenarioAvailable).toBe(true);
    expect(result.current.scenarioDetails?.displayInfo.name).toBe(
      "Your Portfolio"
    );
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

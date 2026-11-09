import { screen } from "@testing-library/react";
import { getTestOrdersGroupedByAsset, getTestPortfolio } from "pt-domain";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { customRender, customWaitFor } from "../../testUtils/componentHelpers";
import { setUserData } from "../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../testUtils/networkMock";
import WithdrawalPlanner from "./WithdrawalPlanner";

vi.mock("../charts/ChartContainer", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
}));

vi.mock("../charts/ForecastChartBody", () => ({
  ForecastChartBody: () => <div data-testid="forecast-chart-body" />,
}));

const portfolioName = "plannerPortfolio";

setUserData({
  portfolios: {
    [portfolioName]: getTestPortfolio({
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
    }),
  },
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

const renderPlanner = () =>
  customRender({
    component: <WithdrawalPlanner portfolioNames={[portfolioName]} />,
  });

const getSimulateButton = () =>
  screen.getByRole("button", { name: "Simulate plan" });

const waitForSimulateEnabled = () =>
  customWaitFor(() => expect(getSimulateButton()).toBeEnabled());

const waitForResult = () =>
  screen.findByText(/of simulations fund the full plan/);

const getPlanEnd = () =>
  screen.getByText("At plan end").nextElementSibling?.textContent;

describe("WithdrawalPlanner", () => {
  it("prompts before the first simulation and disables the action until ready", async () => {
    renderPlanner();

    expect(getSimulateButton()).toBeDisabled();
    expect(
      screen.getByText("Set your assumptions, then select Simulate plan.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/of simulations fund the full plan/)
    ).not.toBeInTheDocument();

    await waitForSimulateEnabled();
  });

  it("shows the result after the simulate action", async () => {
    const { user } = renderPlanner();
    await waitForSimulateEnabled();

    await user.click(getSimulateButton());

    expect(await waitForResult()).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("submits with Enter", async () => {
    const { user } = renderPlanner();
    await waitForSimulateEnabled();
    const years = screen.getByLabelText("Years until retirement");

    await user.clear(years);
    await user.type(years, "2{Enter}");

    expect(await waitForResult()).toBeInTheDocument();
  });

  it("keeps the displayed result when inputs change", async () => {
    const { user } = renderPlanner();
    await waitForSimulateEnabled();
    await user.click(getSimulateButton());
    await waitForResult();

    const before = getPlanEnd();

    const inflation = screen.getByLabelText("Inflation");
    await user.clear(inflation);
    await user.type(inflation, "20");
    await user.tab();

    expect(getPlanEnd()).toBe(before);
  });
});

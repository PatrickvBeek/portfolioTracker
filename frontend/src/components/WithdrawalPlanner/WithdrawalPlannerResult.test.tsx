import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import { getTestWithdrawalSummary } from "../../testUtils/withdrawalPlannerHelpers";
import type { ForecastChartData } from "../charts/forecastChartUtils";
import type {
  WithdrawalPlannerResultState,
  WithdrawalResultSummary,
} from "./WithdrawalPlanner.logic";
import { WithdrawalPlannerResult } from "./WithdrawalPlannerResult";

vi.mock("../charts/ChartContainer", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
}));

vi.mock("../charts/ForecastChartBody", () => ({
  ForecastChartBody: () => <div data-testid="forecast-chart-body" />,
}));

const chartData: ForecastChartData = [
  { timestamp: 0, median: 100, uncertaintyBand: [80, 120], cashFlow: 0 },
];

type RenderOptions = {
  status?: "ready" | "updating" | "loading" | "unavailable" | "error";
  kind?: "marketValue" | "calculation";
  summary?: WithdrawalResultSummary;
  data?: ForecastChartData;
};

const buildState = (
  options: RenderOptions = {}
): WithdrawalPlannerResultState => {
  const status = options.status ?? "ready";

  if (status === "error") {
    return { status, kind: options.kind ?? "calculation" };
  }
  if (status === "loading" || status === "unavailable") {
    return { status };
  }

  return {
    status,
    result: {
      summary: options.summary ?? getTestWithdrawalSummary(),
      chartData: options.data ?? chartData,
    },
  };
};

const renderResult = (options: RenderOptions = {}) =>
  customRender({
    component: (
      <WithdrawalPlannerResult state={buildState(options)} scenario="market" />
    ),
  });

describe("WithdrawalPlannerResult", () => {
  it("renders the funded share as a heading", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 490 }),
    });

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "51% of simulations fund the full plan",
      })
    ).toBeInTheDocument();
  });

  it("renders the meter with proportional segment widths", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 490 }),
    });

    const meter = screen.getByRole("meter");

    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "51");
    expect(meter).toHaveAttribute(
      "aria-label",
      "Share of simulations that fund the full plan"
    );
    expect(meter).toHaveAttribute(
      "aria-valuetext",
      "51% of simulations fund the full plan"
    );

    expect(screen.getByTestId("meter-success")).toHaveStyle({
      width: "51%",
    });
  });

  it("renders both meter labels", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 490 }),
    });

    expect(screen.getByText("success 51%")).toBeInTheDocument();
    expect(screen.getByText("ruin 49%")).toBeInTheDocument();
  });

  it("shows the no-ruin sentence", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 0 }),
    });

    expect(
      screen.getByText("No simulation ran out of money.")
    ).toBeInTheDocument();
  });

  it("shows the all-ruin sentence", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 1000 }),
    });

    expect(
      screen.getByText("All simulations ran out of money.")
    ).toBeInTheDocument();
  });

  it("shows the one-in-N ruin sentence", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ ruinedCount: 250 }),
    });

    expect(
      screen.getByText(
        "About 1 in 4 simulations cannot cover the intended withdrawal."
      )
    ).toBeInTheDocument();
  });

  it("shows the median portfolio values", () => {
    renderResult();

    expect(
      screen.getByText("At retirement").nextElementSibling
    ).toHaveTextContent("250,000 €");
    expect(
      screen.getByText("At plan end").nextElementSibling
    ).toHaveTextContent("120,000 €");
  });

  it("explains a ruined median when the plan end value is zero", () => {
    renderResult({
      summary: getTestWithdrawalSummary({ atPlanEnd: 0, isMedianRuined: true }),
    });

    expect(
      screen.getByText("The median simulation is ruined before the plan ends.")
    ).toBeInTheDocument();
  });

  it("explains a ruined median when the plan end value rounds to zero", () => {
    renderResult({
      summary: getTestWithdrawalSummary({
        atPlanEnd: 0.4,
        isMedianRuined: true,
      }),
    });

    expect(
      screen.getByText("The median simulation is ruined before the plan ends.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("At plan end").nextElementSibling
    ).toHaveTextContent("€0");
  });

  it("keeps the previous values visible while updating", () => {
    renderResult({
      status: "updating",
      summary: getTestWithdrawalSummary({ ruinedCount: 300 }),
    });

    expect(screen.getByRole("status")).toHaveTextContent("Updating...");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "70% of simulations fund the full plan",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("At retirement").nextElementSibling
    ).toHaveTextContent("250,000 €");
  });

  it("shows a market value error without metrics or chart", () => {
    renderResult({ status: "error", kind: "marketValue" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load the current portfolio value."
    );
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("shows a calculation error without metrics or chart", () => {
    renderResult({ status: "error", kind: "calculation" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not calculate the forecast."
    );
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("does not show the chart when data is unavailable", () => {
    renderResult({ status: "unavailable" });

    expect(screen.getByText(/insufficient/)).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("shows Calculating while loading without a summary", () => {
    renderResult({ status: "loading" });

    expect(screen.getByText("Calculating...")).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("shows the chart for a successful forecast", () => {
    renderResult();

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("forecast-chart-body")).toBeInTheDocument();
    expect(
      screen.getByText(`Based on ${(1000).toLocaleString()} simulations.`)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Based on market return assumptions.")
    ).toBeInTheDocument();
  });
});

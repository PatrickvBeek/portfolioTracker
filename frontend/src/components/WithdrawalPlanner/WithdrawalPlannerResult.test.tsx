import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import { getTestWithdrawalSummary } from "../../testUtils/withdrawalPlannerHelpers";
import type { ForecastChartData } from "../charts/forecastChartUtils";
import type { ForecastScenario } from "../charts/forecastScenario.logic";
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

type ResultStatus = WithdrawalPlannerResultState["status"];
type ResultErrorKind = Extract<
  WithdrawalPlannerResultState,
  { status: "error" }
>["kind"];

type RenderOptions = {
  status?: ResultStatus;
  kind?: ResultErrorKind;
  summary?: WithdrawalResultSummary;
  scenario?: ForecastScenario;
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
      scenario: options.scenario ?? "market",
      summary: options.summary ?? getTestWithdrawalSummary(),
      chartData: options.data ?? chartData,
    },
  };
};

const renderResult = (options: RenderOptions = {}) =>
  customRender({
    component: <WithdrawalPlannerResult state={buildState(options)} />,
  });

const renderSummary = (
  overrides: Partial<WithdrawalResultSummary> = {}
): void => {
  renderResult({ summary: getTestWithdrawalSummary(overrides) });
};

describe("WithdrawalPlannerResult", () => {
  it("renders the funded share as a heading", () => {
    renderSummary({ ruinedCount: 490 });

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "51% of simulations fund the full plan",
      })
    ).toBeInTheDocument();
  });

  it.each([
    {
      ruinedCount: 0,
      successPercent: 100,
      successLabel: "100%",
      ruinLabel: "0%",
      note: "No simulation ran out of money.",
    },
    {
      ruinedCount: 1,
      successPercent: 100,
      successLabel: ">99%",
      ruinLabel: "<1%",
      note: "About 1 in 1000 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 490,
      successPercent: 51,
      successLabel: "51%",
      ruinLabel: "49%",
      note: "About 1 in 2 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 495,
      successPercent: 51,
      successLabel: "51%",
      ruinLabel: "49%",
      note: "About 1 in 2 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 501,
      successPercent: 50,
      successLabel: "50%",
      ruinLabel: "50%",
      note: "About 1 in 2 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 505,
      successPercent: 50,
      successLabel: "50%",
      ruinLabel: "50%",
      note: "About 1 in 2 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 999,
      successPercent: 0,
      successLabel: "<1%",
      ruinLabel: ">99%",
      note: "About 1 in 1 simulations cannot cover the intended withdrawal.",
    },
    {
      ruinedCount: 1000,
      successPercent: 0,
      successLabel: "0%",
      ruinLabel: "100%",
      note: "All simulations ran out of money.",
    },
  ])(
    "renders $ruinedCount ruined of 1000 as $successLabel surviving",
    ({ ruinedCount, successPercent, successLabel, ruinLabel, note }) => {
      renderSummary({ ruinedCount });

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        `${successLabel} of simulations fund the full plan`
      );
      expect(screen.getByRole("meter")).toHaveAttribute(
        "aria-valuenow",
        `${successPercent}`
      );
      expect(screen.getByTestId("meter-success")).toHaveStyle({
        width: `${successPercent}%`,
      });
      expect(screen.getByText(`success ${successLabel}`)).toBeInTheDocument();
      expect(screen.getByText(`ruin ${ruinLabel}`)).toBeInTheDocument();
      expect(screen.getByText(note)).toBeInTheDocument();
    }
  );

  it("describes the meter for assistive technology", () => {
    renderSummary({ ruinedCount: 490 });

    const meter = screen.getByRole("meter");

    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute(
      "aria-label",
      "Share of simulations that fund the full plan"
    );
    expect(meter).toHaveAttribute(
      "aria-valuetext",
      "51% of simulations fund the full plan"
    );
  });

  it("shows the median portfolio values", () => {
    renderSummary();

    expect(screen.getByText("At retirement")).toBeInTheDocument();
    expect(screen.getByText("250,000 €")).toBeInTheDocument();
    expect(screen.getByText("At plan end")).toBeInTheDocument();
    expect(screen.getByText("120,000 €")).toBeInTheDocument();
  });

  it("shows a zero plan end as euros and explains the ruined median", () => {
    renderSummary({ atPlanEnd: 0, isMedianRuined: true });

    expect(screen.getByText("At plan end")).toBeInTheDocument();
    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(
      screen.getByText("The median simulation is ruined before the plan ends.")
    ).toBeInTheDocument();
  });

  it("rounds a sub-euro plan end to zero and explains the ruined median", () => {
    renderSummary({ atPlanEnd: 0.4, isMedianRuined: true });

    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(
      screen.getByText("The median simulation is ruined before the plan ends.")
    ).toBeInTheDocument();
  });

  it("omits the ruin note for a surviving median", () => {
    renderSummary({ isMedianRuined: false });

    expect(
      screen.queryByText(
        "The median simulation is ruined before the plan ends."
      )
    ).not.toBeInTheDocument();
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
    expect(screen.getByText("250,000 €")).toBeInTheDocument();
  });

  it("shows no update notice for a settled result", () => {
    renderSummary();

    expect(screen.queryByText("Updating...")).not.toBeInTheDocument();
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

  it("shows the chart and the simulation count for a successful forecast", () => {
    renderSummary();

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("forecast-chart-body")).toBeInTheDocument();
    expect(
      screen.getByText(/^Based on 1[.,]000 simulations\.$/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Based on market return assumptions.")
    ).toBeInTheDocument();
  });

  it("uses the scenario snapshot stored with the result", () => {
    renderResult({ scenario: "portfolio" });

    expect(
      screen.getByText("Based on portfolio return assumptions.")
    ).toBeInTheDocument();
  });

  it("shows the de-risking note after the chart", () => {
    renderSummary();

    const note = screen.getByText(/This forecast assumes the same allocation/);
    const chart = screen.getByTestId("chart-container");

    expect(
      chart.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(note).toHaveTextContent(
      "If you plan to de-risk at retirement, ruin risk may be higher than shown."
    );
  });
});

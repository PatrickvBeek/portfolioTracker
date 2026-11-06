import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import type { ForecastChartData } from "../charts/forecastChartUtils";
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

const renderResult = ({
  isLoading = false,
  isError = false,
  ruinPercent,
  data = chartData,
}: {
  isLoading?: boolean;
  isError?: boolean;
  ruinPercent?: number;
  data?: ForecastChartData;
}) =>
  customRender({
    component: (
      <WithdrawalPlannerResult
        isLoading={isLoading}
        isError={isError}
        ruinPercent={ruinPercent}
        scenario="market"
        chartData={data}
      />
    ),
  });

describe("WithdrawalPlannerResult", () => {
  it("does not show the chart on error", () => {
    renderResult({ isError: true, ruinPercent: 10 });

    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("does not show the chart without ruin probability and data", () => {
    renderResult({ ruinPercent: undefined, data: [] });

    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("shows the chart for a successful forecast", () => {
    renderResult({ ruinPercent: 10 });

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("forecast-chart-body")).toBeInTheDocument();
  });
});

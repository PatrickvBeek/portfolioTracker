import { useState } from "react";
import { screen } from "@testing-library/react";
import { customRender } from "../../testUtils/componentHelpers";
import { getScenarioDetails } from "../charts/forecastScenario.logic";
import { type WithdrawalPlannerParameters } from "./WithdrawalPlanner.logic";
import { WithdrawalPlannerForm } from "./WithdrawalPlannerForm";

const PLAN_START = new Date(2021, 0, 1).getTime();

const PORTFOLIO_GBM = { mu: 0.005, sigma: 0.04 };

const defaultParameters: WithdrawalPlannerParameters = {
  scenario: "market",
  accumulationYears: 5,
  decumulationYears: 20,
  monthlyContribution: null,
  monthlyWithdrawal: null,
  inflationRate: 0.02,
};

const TestForm = ({
  initialParameters = defaultParameters,
  derivedMonthlyContribution,
  portfolioAvailable = false,
  canSimulate = true,
}: {
  initialParameters?: WithdrawalPlannerParameters;
  derivedMonthlyContribution: number | undefined;
  portfolioAvailable?: boolean;
  canSimulate?: boolean;
}) => {
  const [parameters, setParameters] = useState(initialParameters);
  const scenarioDetails = getScenarioDetails(
    parameters.scenario,
    portfolioAvailable ? PORTFOLIO_GBM : undefined
  );

  return (
    <WithdrawalPlannerForm
      planStart={PLAN_START}
      parameters={parameters}
      scenarioDetails={scenarioDetails}
      isPortfolioScenarioAvailable={portfolioAvailable}
      derivedMonthlyContribution={derivedMonthlyContribution}
      canSimulate={canSimulate}
      onParameterChange={(key, value) =>
        setParameters((current) => ({ ...current, [key]: value }))
      }
      onSimulate={() => undefined}
    />
  );
};

const UpdatableDerivedForm = () => {
  const [derived, setDerived] = useState(850);

  return (
    <>
      <button
        type="button"
        onClick={() => setDerived((current) => current + 100)}
      >
        Change derived contribution
      </button>
      <TestForm derivedMonthlyContribution={derived} />
    </>
  );
};

const renderForm = (
  props: {
    initialParameters?: WithdrawalPlannerParameters;
    derivedMonthlyContribution?: number | undefined;
    portfolioAvailable?: boolean;
    canSimulate?: boolean;
  } = {}
) =>
  customRender({
    component: <TestForm derivedMonthlyContribution={850} {...props} />,
  });

describe("WithdrawalPlannerForm", () => {
  it("shows the dates for the chosen whole-year durations", async () => {
    const { user } = renderForm();

    expect(await screen.findByText("Retire around January 2026")).toBeTruthy();
    expect(screen.getByText("Plan ends around January 2046")).toBeTruthy();

    await user.clear(screen.getByLabelText("Years until retirement"));
    await user.type(screen.getByLabelText("Years until retirement"), "10");

    expect(await screen.findByText("Retire around January 2031")).toBeTruthy();
    expect(screen.getByText("Plan ends around January 2051")).toBeTruthy();
  });

  it("rejects a plan with both phases at zero", async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText("Years until retirement"));
    await user.type(screen.getByLabelText("Years until retirement"), "0");
    await user.clear(screen.getByLabelText("Years in retirement"));
    await user.type(screen.getByLabelText("Years in retirement"), "0");

    expect(await screen.findByText("Set at least one phase.")).toBeTruthy();
  });

  it("marks an edited contribution as custom and restores automatic", async () => {
    const { user } = renderForm();
    const contribution = screen.getByLabelText("Monthly contribution");

    expect(contribution).toHaveValue(850);
    await user.clear(contribution);
    await user.type(contribution, "1000");

    expect(await screen.findByText("Custom amount")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Use automatic" }));

    expect(
      await screen.findByText("Calculated from your cash flow")
    ).toBeTruthy();
    expect(contribution).toHaveValue(850);
  });

  it("fills the withdrawal with the automatic contribution", () => {
    renderForm();

    expect(screen.getByLabelText("Monthly withdrawal")).toHaveValue(850);
  });

  it("decouples an edited withdrawal and returns to automatic when cleared", async () => {
    const { user } = renderForm();
    const withdrawal = screen.getByLabelText("Monthly withdrawal");

    await user.clear(withdrawal);
    await user.type(withdrawal, "2000");
    expect(withdrawal).toHaveValue(2000);

    await user.clear(withdrawal);
    await user.tab();
    expect(withdrawal).toHaveValue(850);
  });

  it("shows the empty state without cash flow history", () => {
    renderForm({ derivedMonthlyContribution: undefined });

    expect(screen.getByLabelText("Monthly contribution")).toHaveValue(null);
    expect(
      screen.getByText("No cash flow history. Enter an amount.")
    ).toBeTruthy();
    expect(screen.getByLabelText("Monthly withdrawal")).toHaveValue(null);
    expect(screen.getByText("Enter an amount.")).toBeTruthy();
    expect(
      screen.queryByText("No withdrawals. The plan cannot run out of money.")
    ).toBeNull();
  });

  it("warns that a zero withdrawal cannot exhaust the plan", async () => {
    const { user } = renderForm();
    const withdrawal = screen.getByLabelText("Monthly withdrawal");

    await user.clear(withdrawal);
    await user.type(withdrawal, "0");

    expect(
      await screen.findByText(
        "No withdrawals. The plan cannot run out of money."
      )
    ).toBeTruthy();
  });

  it("disables the withdrawal when there is no withdrawal phase", async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText("Years in retirement"));
    await user.type(screen.getByLabelText("Years in retirement"), "0");

    expect(screen.getByLabelText("Monthly withdrawal")).toBeDisabled();
    expect(
      screen.getByText(
        "No withdrawal phase. The result shows accumulation only."
      )
    ).toBeTruthy();
  });

  it("clamps out-of-range input in the field after blur", async () => {
    const { user } = renderForm();
    const years = screen.getByLabelText("Years until retirement");
    const withdrawal = screen.getByLabelText("Monthly withdrawal");

    await user.clear(years);
    await user.type(years, "61");
    await user.tab();
    expect(years).toHaveValue(60);

    await user.clear(withdrawal);
    await user.type(withdrawal, "20000");
    await user.tab();
    expect(withdrawal).toHaveValue(10_000);
  });

  it("disables the simulate action when the basis is not ready", () => {
    renderForm({ canSimulate: false });

    expect(
      screen.getByRole("button", { name: "Simulate plan" })
    ).toBeDisabled();
  });

  it("enables the simulate action when the basis is ready", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "Simulate plan" })).toBeEnabled();
  });

  it("clamps out-of-range input when the form is submitted", async () => {
    const { user } = renderForm();
    const years = screen.getByLabelText("Years until retirement");

    await user.clear(years);
    await user.type(years, "61{Enter}");

    expect(years).toHaveValue(60);
  });

  it("tracks the derived contribution until the withdrawal is edited", async () => {
    const { user } = customRender({ component: <UpdatableDerivedForm /> });
    const withdrawal = screen.getByLabelText("Monthly withdrawal");
    const changeDerived = screen.getByRole("button", {
      name: "Change derived contribution",
    });

    expect(withdrawal).toHaveValue(850);

    await user.click(changeDerived);
    expect(withdrawal).toHaveValue(950);

    await user.clear(withdrawal);
    await user.type(withdrawal, "2000");
    await user.tab();

    await user.click(changeDerived);
    expect(withdrawal).toHaveValue(2000);
  });

  it("defaults to the market scenario", async () => {
    renderForm();

    expect(
      screen.getByRole("radio", { name: "Market average" })
    ).toHaveAttribute("aria-checked", "true");
    expect(await screen.findByText("Annual return: 9.0%")).toBeTruthy();
    expect(screen.getByText("Volatility: 16.5%")).toBeTruthy();
  });

  it("disables the portfolio scenario without parameters", () => {
    renderForm();

    expect(
      screen.getByRole("radio", { name: "Your portfolio" })
    ).toBeDisabled();
  });

  it("enables the portfolio scenario when parameters are available", async () => {
    const { user } = renderForm({ portfolioAvailable: true });
    const portfolioOption = screen.getByRole("radio", {
      name: "Your portfolio",
    });

    expect(portfolioOption).toBeEnabled();
    await user.click(portfolioOption);

    expect(portfolioOption).toHaveAttribute("aria-checked", "true");
    expect(await screen.findByText("Your Portfolio")).toBeTruthy();
    expect(
      screen.getByText("Based on your portfolio's historical performance")
    ).toBeTruthy();
  });
});

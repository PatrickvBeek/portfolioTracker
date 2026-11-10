import { FormEvent, ReactNode, useState } from "react";
import { Button } from "../ui/Button";
import { Heading } from "../ui/Heading";
import { Input } from "../ui/Input";
import { ToggleGroup, ToggleItem } from "../ui/ToggleGroup";
import {
  ForecastScenario,
  ScenarioDetails,
} from "../charts/forecastScenario.logic";
import { ScenarioSummary } from "../charts/ScenarioSummary";
import {
  MAX_MONTHLY_WITHDRAWAL,
  MAX_PLAN_YEARS,
  buildPlanDates,
  hasPositivePhase,
  parseInflationPercent,
  parseMonthlyWithdrawal,
  parseNonNegativeNumber,
  parseYears,
  type WithdrawalPlannerParameters,
} from "./WithdrawalPlanner.logic";
import { styles } from "./WithdrawalPlanner.styles";

const DurationField = ({
  id,
  label,
  years,
  onChange,
}: {
  id: string;
  label: string;
  years: number;
  onChange: (years: number) => void;
}) => {
  const [draft, setDraft] = useState<string>();

  return (
    <div className={styles.controlGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputAdornment}>
        <Input
          id={id}
          type="number"
          min={0}
          max={MAX_PLAN_YEARS}
          step={1}
          value={draft ?? String(years)}
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            onChange(parseYears(value));
          }}
          onBlur={() => setDraft(undefined)}
          className={styles.inputWidth}
        />
        <span className={styles.adornmentText}>years</span>
      </div>
    </div>
  );
};

const MoneyField = ({
  id,
  label,
  value,
  automaticValue,
  min,
  max,
  step,
  parse,
  onChange,
  describedBy,
  disabled,
  onUseAutomatic,
  footer,
}: {
  id: string;
  label: string;
  value: number | null;
  automaticValue: number | undefined;
  min: number;
  max?: number;
  step: number;
  parse: (value: string) => number;
  onChange: (value: number | null) => void;
  describedBy: string;
  disabled?: boolean;
  onUseAutomatic?: () => void;
  footer: ReactNode;
}) => {
  const [draft, setDraft] = useState<string>();
  const automaticText =
    automaticValue === undefined ? "" : String(automaticValue);
  const displayValue =
    draft ?? (value !== null ? String(value) : automaticText);

  return (
    <div className={styles.controlGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputAdornment}>
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraft(nextValue);
            onChange(nextValue === "" ? null : parse(nextValue));
          }}
          onBlur={() => setDraft(undefined)}
          disabled={disabled}
          aria-describedby={describedBy}
          className={styles.inputWidth}
        />
        <span className={styles.adornmentText}>€ per month</span>
      </div>
      {footer}
      {onUseAutomatic && (
        <button
          type="button"
          className={styles.actionText}
          onClick={() => {
            setDraft(undefined);
            onUseAutomatic();
          }}
        >
          Use automatic
        </button>
      )}
    </div>
  );
};

const PercentField = ({
  id,
  label,
  percent,
  onChange,
  footer,
}: {
  id: string;
  label: string;
  percent: number;
  onChange: (percent: string) => void;
  footer: ReactNode;
}) => {
  const [draft, setDraft] = useState<string>();

  return (
    <div className={styles.controlGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputAdornment}>
        <Input
          id={id}
          type="number"
          min={0}
          max={20}
          step={0.5}
          value={draft ?? String(percent)}
          onChange={(event) => {
            setDraft(event.target.value);
            onChange(event.target.value);
          }}
          onBlur={() => setDraft(undefined)}
          aria-describedby={`${id}-helper`}
          className={styles.inputWidth}
        />
        <span className={styles.adornmentText}>%</span>
      </div>
      {footer}
    </div>
  );
};

const ReturnAssumptionField = ({
  scenario,
  scenarioDetails,
  isPortfolioScenarioAvailable,
  onScenarioChange,
}: {
  scenario: ForecastScenario;
  scenarioDetails: ScenarioDetails | undefined;
  isPortfolioScenarioAvailable: boolean;
  onScenarioChange: (scenario: ForecastScenario) => void;
}) => {
  return (
    <div className={styles.controlGroup}>
      <span className={styles.label}>Return assumption</span>
      <ToggleGroup>
        <ToggleItem
          value="market"
          selected={scenario === "market"}
          onSelect={() => onScenarioChange("market")}
        >
          Market average
        </ToggleItem>
        <ToggleItem
          value="portfolio"
          selected={scenario === "portfolio"}
          onSelect={() => onScenarioChange("portfolio")}
          disabled={!isPortfolioScenarioAvailable}
        >
          Your portfolio
        </ToggleItem>
      </ToggleGroup>
      {scenarioDetails && (
        <ScenarioSummary displayInfo={scenarioDetails.displayInfo} />
      )}
    </div>
  );
};

const PlanSummary = ({
  planStart,
  accumulationYears,
  decumulationYears,
}: {
  planStart: number;
  accumulationYears: number;
  decumulationYears: number;
}) => {
  if (!hasPositivePhase(accumulationYears, decumulationYears)) {
    return (
      <p role="alert" className={styles.validationText}>
        Set at least one phase.
      </p>
    );
  }

  const planDates = buildPlanDates(
    planStart,
    accumulationYears,
    decumulationYears
  );
  const totalYears = accumulationYears + decumulationYears;
  const accumulationShare = (accumulationYears / totalYears) * 100;

  return (
    <div className={styles.planTimeline}>
      <div className={styles.timelineTrack}>
        {accumulationYears > 0 && (
          <div
            className={styles.timelineBuildUp}
            style={{ width: `${accumulationShare}%` }}
          />
        )}
        {decumulationYears > 0 && (
          <div
            className={styles.timelineWithdrawal}
            style={{ width: `${100 - accumulationShare}%` }}
          />
        )}
      </div>
      <div className={styles.timelineLabels}>
        <span>
          Build-up · {accumulationYears}{" "}
          {accumulationYears === 1 ? "year" : "years"}
        </span>
        <span>
          Withdrawal · {decumulationYears}{" "}
          {decumulationYears === 1 ? "year" : "years"}
        </span>
      </div>
      <div className={styles.planDates}>
        <p>{planDates.retirementLabel}</p>
        <p>{planDates.planEndLabel}</p>
      </div>
    </div>
  );
};

type WithdrawalPlannerFormProps = {
  planStart: number;
  parameters: WithdrawalPlannerParameters;
  scenarioDetails: ScenarioDetails | undefined;
  isPortfolioScenarioAvailable: boolean;
  derivedMonthlyContribution: number | undefined;
  canSimulate: boolean;
  onParameterChange: <K extends keyof WithdrawalPlannerParameters>(
    key: K,
    value: WithdrawalPlannerParameters[K]
  ) => void;
  onSimulate: () => void;
};

export function WithdrawalPlannerForm({
  planStart,
  parameters,
  scenarioDetails,
  isPortfolioScenarioAvailable,
  derivedMonthlyContribution,
  canSimulate,
  onParameterChange,
  onSimulate,
}: WithdrawalPlannerFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSimulate) {
      return;
    }

    const activeElement = event.currentTarget.ownerDocument.activeElement;
    if (
      activeElement instanceof HTMLInputElement &&
      event.currentTarget.contains(activeElement)
    ) {
      activeElement.blur();
    }
    onSimulate();
  };

  const contributionHelper =
    parameters.monthlyContribution !== null
      ? "Custom amount"
      : derivedMonthlyContribution === undefined
        ? "No cash flow history. Enter an amount."
        : "Calculated from your cash flow";

  const withdrawalUnavailable =
    parameters.monthlyWithdrawal === null &&
    derivedMonthlyContribution === undefined;
  const isWithdrawalDisabled = parameters.decumulationYears === 0;
  const withdrawalValue =
    parameters.monthlyWithdrawal ?? derivedMonthlyContribution;
  const showNoWithdrawals =
    !isWithdrawalDisabled &&
    withdrawalValue !== undefined &&
    withdrawalValue === 0;

  return (
    <form className={styles.sectionCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.sectionBody}>
        <Heading level="h1">Withdrawal Planner</Heading>

        <section className={styles.formGroup}>
          <Heading level="section">Assumptions</Heading>
          <div className={styles.controlsGrid}>
            <ReturnAssumptionField
              scenario={parameters.scenario}
              scenarioDetails={scenarioDetails}
              isPortfolioScenarioAvailable={isPortfolioScenarioAvailable}
              onScenarioChange={(scenario) =>
                onParameterChange("scenario", scenario)
              }
            />
            <PercentField
              id="withdrawal-inflation"
              label="Inflation"
              percent={Number((parameters.inflationRate * 100).toFixed(2))}
              onChange={(value) =>
                onParameterChange("inflationRate", parseInflationPercent(value))
              }
              footer={
                <p
                  id="withdrawal-inflation-helper"
                  className={styles.helperText}
                >
                  Raises withdrawals at{" "}
                  {Number((parameters.inflationRate * 100).toFixed(2))}% per
                  year and converts results to today's money.
                </p>
              }
            />
          </div>
          <p className={styles.helperText}>
            Contributions are nominal and do not rise with inflation.
          </p>
        </section>

        <section className={styles.formGroup}>
          <Heading level="section">Build-up</Heading>
          <div className={styles.controlsGrid}>
            <DurationField
              id="withdrawal-accumulation-years"
              label="Years until retirement"
              years={parameters.accumulationYears}
              onChange={(years) =>
                onParameterChange("accumulationYears", years)
              }
            />
            <MoneyField
              id="withdrawal-contribution"
              label="Monthly contribution"
              value={parameters.monthlyContribution}
              automaticValue={derivedMonthlyContribution}
              min={0}
              step={50}
              parse={parseNonNegativeNumber}
              onChange={(value) =>
                onParameterChange("monthlyContribution", value)
              }
              describedBy="withdrawal-contribution-helper"
              onUseAutomatic={
                parameters.monthlyContribution === null
                  ? undefined
                  : () => onParameterChange("monthlyContribution", null)
              }
              footer={
                <p
                  id="withdrawal-contribution-helper"
                  className={styles.helperText}
                >
                  {contributionHelper}
                </p>
              }
            />
          </div>
        </section>

        <section className={styles.formGroup}>
          <Heading level="section">Withdrawal</Heading>
          <div className={styles.controlsGrid}>
            <DurationField
              id="withdrawal-decumulation-years"
              label="Years in retirement"
              years={parameters.decumulationYears}
              onChange={(years) =>
                onParameterChange("decumulationYears", years)
              }
            />
            <MoneyField
              id="withdrawal-withdrawal"
              label="Monthly withdrawal"
              value={parameters.monthlyWithdrawal}
              automaticValue={derivedMonthlyContribution}
              min={0}
              max={MAX_MONTHLY_WITHDRAWAL}
              step={100}
              parse={parseMonthlyWithdrawal}
              onChange={(value) =>
                onParameterChange("monthlyWithdrawal", value)
              }
              describedBy="withdrawal-withdrawal-helper"
              disabled={isWithdrawalDisabled}
              footer={
                <>
                  <p
                    id="withdrawal-withdrawal-helper"
                    className={styles.helperText}
                  >
                    {isWithdrawalDisabled
                      ? "No withdrawal phase. The result shows accumulation only."
                      : withdrawalUnavailable
                        ? "Enter an amount."
                        : "In today's money. Rises with inflation."}
                  </p>
                  {showNoWithdrawals && (
                    <p className={styles.helperText}>
                      No withdrawals. The plan cannot run out of money.
                    </p>
                  )}
                </>
              }
            />
          </div>
        </section>

        <PlanSummary
          planStart={planStart}
          accumulationYears={parameters.accumulationYears}
          decumulationYears={parameters.decumulationYears}
        />

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={!canSimulate}>
            Simulate plan
          </Button>
        </div>
      </div>
    </form>
  );
}

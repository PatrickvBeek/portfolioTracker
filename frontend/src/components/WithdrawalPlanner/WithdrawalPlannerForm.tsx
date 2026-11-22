import { FormEvent, useState } from "react";
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
  type WithdrawalPlannerParameters,
} from "./WithdrawalPlanner.logic";
import { addMonths } from "../../utility/dates";
import { styles } from "./WithdrawalPlanner.styles";

const INFLATION_MAX_PERCENT = 20;

const toMonths = (years: number): number => Math.round(years * 12);

const parseYears = (value: string): number => {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(MAX_PLAN_YEARS, Math.max(0, Math.trunc(parsed)));
};

const parseNonNegativeNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const parseMonthlyWithdrawal = (value: string): number =>
  Math.min(MAX_MONTHLY_WITHDRAWAL, parseNonNegativeNumber(value));

const parseInflationPercent = (value: string): number =>
  Math.min(INFLATION_MAX_PERCENT, parseNonNegativeNumber(value)) / 100;

const PLAN_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

interface PlanDates {
  retirementLabel: string;
  planEndLabel: string;
}

const buildPlanDates = (
  planStart: number,
  accumulationYears: number,
  decumulationYears: number
): PlanDates => {
  const accumulationMonths = toMonths(accumulationYears);
  const decumulationMonths = toMonths(decumulationYears);
  const retirementDate = addMonths(planStart, accumulationMonths);
  const planEndDate = addMonths(
    planStart,
    accumulationMonths + decumulationMonths
  );

  return {
    retirementLabel:
      accumulationMonths === 0
        ? "Retire now"
        : `Retire around ${PLAN_DATE_FORMATTER.format(retirementDate)}`,
    planEndLabel:
      decumulationMonths === 0
        ? "No withdrawal phase"
        : `Plan ends around ${PLAN_DATE_FORMATTER.format(planEndDate)}`,
  };
};

const NumberField = ({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  disabled,
  describedBy,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max?: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  describedBy?: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
}) => (
  <>
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-describedby={describedBy}
        className={styles.inputWidth}
      />
      <span className={styles.adornmentText}>{suffix}</span>
    </div>
  </>
);

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
      <NumberField
        id={id}
        label={label}
        value={draft ?? String(years)}
        min={0}
        max={MAX_PLAN_YEARS}
        step={1}
        suffix="years"
        onChange={(raw) => {
          setDraft(raw);
          onChange(parseYears(raw));
        }}
        onBlur={() => setDraft(undefined)}
      />
    </div>
  );
};

const ContributionField = ({
  value,
  automaticValue,
  onChange,
}: {
  value: number | null;
  automaticValue: number | undefined;
  onChange: (value: number | null) => void;
}) => {
  const [draft, setDraft] = useState<string>();
  const automaticText =
    automaticValue === undefined ? "" : String(automaticValue);
  const displayValue =
    draft ?? (value !== null ? String(value) : automaticText);
  const helper =
    value !== null
      ? "Custom amount"
      : automaticValue === undefined
        ? "No cash flow history. Enter an amount."
        : "Calculated from your cash flow";

  return (
    <div className={styles.controlGroup}>
      <NumberField
        id="withdrawal-contribution"
        label="Monthly contribution"
        value={displayValue}
        min={0}
        step={50}
        suffix="€ per month"
        describedBy="withdrawal-contribution-helper"
        onChange={(raw) => {
          setDraft(raw);
          onChange(raw === "" ? null : parseNonNegativeNumber(raw));
        }}
        onBlur={() => setDraft(undefined)}
      />
      <p id="withdrawal-contribution-helper" className={styles.helperText}>
        {helper}
      </p>
      {value !== null && (
        <button
          type="button"
          className={styles.actionText}
          onClick={() => {
            setDraft(undefined);
            onChange(null);
          }}
        >
          Use automatic
        </button>
      )}
    </div>
  );
};

const WithdrawalField = ({
  value,
  automaticValue,
  disabled,
  onChange,
}: {
  value: number | null;
  automaticValue: number | undefined;
  disabled: boolean;
  onChange: (value: number | null) => void;
}) => {
  const [draft, setDraft] = useState<string>();
  const automaticText =
    automaticValue === undefined ? "" : String(automaticValue);
  const displayValue =
    draft ?? (value !== null ? String(value) : automaticText);
  const effectiveValue = value ?? automaticValue;
  const helper = disabled
    ? "No withdrawal phase. The result shows accumulation only."
    : effectiveValue === undefined
      ? "Enter an amount."
      : "In today's money. Rises with inflation.";

  return (
    <div className={styles.controlGroup}>
      <NumberField
        id="withdrawal-withdrawal"
        label="Monthly withdrawal"
        value={displayValue}
        min={0}
        max={MAX_MONTHLY_WITHDRAWAL}
        step={100}
        suffix="€ per month"
        disabled={disabled}
        describedBy="withdrawal-withdrawal-helper"
        onChange={(raw) => {
          setDraft(raw);
          onChange(raw === "" ? null : parseMonthlyWithdrawal(raw));
        }}
        onBlur={() => setDraft(undefined)}
      />
      <p id="withdrawal-withdrawal-helper" className={styles.helperText}>
        {helper}
      </p>
      {!disabled && effectiveValue === 0 && (
        <p className={styles.helperText}>
          No withdrawals. The plan cannot run out of money.
        </p>
      )}
    </div>
  );
};

const PercentField = ({
  percent,
  onChange,
}: {
  percent: number;
  onChange: (raw: string) => void;
}) => {
  const [draft, setDraft] = useState<string>();

  return (
    <div className={styles.controlGroup}>
      <NumberField
        id="withdrawal-inflation"
        label="Inflation"
        value={draft ?? String(percent)}
        min={0}
        max={INFLATION_MAX_PERCENT}
        step={0.5}
        suffix="%"
        describedBy="withdrawal-inflation-helper"
        onChange={(raw) => {
          setDraft(raw);
          onChange(raw);
        }}
        onBlur={() => setDraft(undefined)}
      />
      <p id="withdrawal-inflation-helper" className={styles.helperText}>
        Raises withdrawals at {percent}% per year and converts results to
        today's money.
      </p>
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
  if (toMonths(accumulationYears) + toMonths(decumulationYears) === 0) {
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
              percent={Number((parameters.inflationRate * 100).toFixed(2))}
              onChange={(value) =>
                onParameterChange("inflationRate", parseInflationPercent(value))
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
            <ContributionField
              value={parameters.monthlyContribution}
              automaticValue={derivedMonthlyContribution}
              onChange={(value) =>
                onParameterChange("monthlyContribution", value)
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
            <WithdrawalField
              value={parameters.monthlyWithdrawal}
              automaticValue={derivedMonthlyContribution}
              disabled={parameters.decumulationYears === 0}
              onChange={(value) =>
                onParameterChange("monthlyWithdrawal", value)
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

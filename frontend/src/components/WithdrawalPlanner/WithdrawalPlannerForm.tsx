import { useState } from "react";
import { Heading } from "../ui/Heading";
import { Input } from "../ui/Input";
import { ToggleGroup, ToggleItem } from "../ui/ToggleGroup";
import {
  parseInflationPercent,
  parseNonNegativeInt,
  parseNonNegativeNumber,
  type WithdrawalPlannerParameters,
} from "./WithdrawalPlanner.logic";
import { styles } from "./WithdrawalPlanner.styles";

type NumericParameterKey = Exclude<
  keyof WithdrawalPlannerParameters,
  "scenario"
>;

type NumericParameter = {
  key: NumericParameterKey;
  label: string;
  min: number;
  max?: number;
  step?: number;
  parse: (value: string) => number | null;
};

const NUMERIC_PARAMETERS: NumericParameter[] = [
  {
    key: "accumulationYears",
    label: "Accumulation Years",
    min: 0,
    parse: parseNonNegativeInt,
  },
  {
    key: "accumulationMonths",
    label: "Accumulation Months",
    min: 0,
    max: 11,
    parse: parseNonNegativeInt,
  },
  {
    key: "monthlyContribution",
    label: "Monthly Contribution",
    min: 0,
    step: 50,
    parse: (value) => (value === "" ? null : parseNonNegativeNumber(value)),
  },
  {
    key: "decumulationYears",
    label: "Decumulation Duration Years",
    min: 0,
    parse: parseNonNegativeInt,
  },
  {
    key: "decumulationMonths",
    label: "Decumulation Duration Months",
    min: 0,
    max: 11,
    parse: parseNonNegativeInt,
  },
  {
    key: "monthlyWithdrawal",
    label: "Monthly Withdrawal",
    min: 0,
    step: 100,
    parse: parseNonNegativeNumber,
  },
];

type WithdrawalPlannerFormProps = {
  parameters: WithdrawalPlannerParameters;
  monthlyContributionFallback?: number;
  onScenarioChange: (scenario: WithdrawalPlannerParameters["scenario"]) => void;
  onParameterChange: (key: NumericParameterKey, value: number | null) => void;
};

export function WithdrawalPlannerForm({
  parameters,
  monthlyContributionFallback,
  onScenarioChange,
  onParameterChange,
}: WithdrawalPlannerFormProps) {
  const [inflationInput, setInflationInput] = useState(
    (parameters.inflationRate * 100).toString()
  );
  const inflationPercent = Number((parameters.inflationRate * 100).toFixed(2));

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionBody}>
        <Heading level="section">Withdrawal Planner</Heading>
        <div className={styles.controlsGrid}>
          <div className={styles.controlGroup}>
            <span className={styles.label}>Scenario</span>
            <ToggleGroup>
              <ToggleItem
                value="market"
                selected={parameters.scenario === "market"}
                onSelect={() => onScenarioChange("market")}
              >
                Market
              </ToggleItem>
              <ToggleItem
                value="portfolio"
                selected={parameters.scenario === "portfolio"}
                onSelect={() => onScenarioChange("portfolio")}
              >
                Portfolio
              </ToggleItem>
            </ToggleGroup>
          </div>

          {NUMERIC_PARAMETERS.map((parameter) => (
            <div key={parameter.key} className={styles.controlGroup}>
              <Input
                label={parameter.label}
                type="number"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
                value={
                  parameters[parameter.key] ?? monthlyContributionFallback ?? ""
                }
                onChange={(event) =>
                  onParameterChange(
                    parameter.key,
                    parameter.parse(event.target.value)
                  )
                }
                className={styles.inputWidth}
              />
            </div>
          ))}

          <div className={styles.controlGroup}>
            <label htmlFor="withdrawal-inflation" className={styles.label}>
              Inflation
            </label>
            <div className={styles.inputAdornment}>
              <Input
                id="withdrawal-inflation"
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={inflationInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setInflationInput(value);
                  onParameterChange(
                    "inflationRate",
                    parseInflationPercent(value)
                  );
                }}
                aria-describedby="withdrawal-inflation-helper"
                className={styles.inputWidth}
              />
              <span className={styles.adornmentText}>%</span>
            </div>
            <p id="withdrawal-inflation-helper" className={styles.helperText}>
              Raises withdrawals at {inflationPercent}% per year and converts
              results to today's money. Contributions stay fixed in euros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

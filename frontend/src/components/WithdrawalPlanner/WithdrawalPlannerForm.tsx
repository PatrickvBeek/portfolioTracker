import { Heading } from "../ui/Heading";
import { Input } from "../ui/Input";
import { ToggleGroup, ToggleItem } from "../ui/ToggleGroup";
import {
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
        </div>
      </div>
    </div>
  );
}

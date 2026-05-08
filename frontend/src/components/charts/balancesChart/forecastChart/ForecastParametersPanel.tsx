import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Info } from "lucide-react";
import { FC, useCallback, useRef, useState } from "react";
import { Input } from "../../../ui/Input";
import { ToggleGroup, ToggleItem } from "../../../ui/ToggleGroup";
import {
  FORECAST_CONFIDENCE_LEVELS,
  FORECAST_HORIZONS,
  ForecastParameters,
  useForecastScenarioParams,
} from "./ForecastChart.logic";
import { styles } from "./ForecastParametersPanel.styles";

interface ForecastParametersPanelProps {
  portfolioNames: string[];
  parameters: ForecastParameters;
  onParametersChange: (parameters: ForecastParameters) => void;
}

export const ForecastParametersPanel: FC<ForecastParametersPanelProps> = ({
  portfolioNames,
  parameters,
  onParametersChange,
}) => {
  const [monthlyContributionInput, setMonthlyContributionInput] = useState(
    parameters.monthlyContribution.toString()
  );
  const [inflationRateInput, setInflationRateInput] = useState(
    (parameters.inflationRate * 100).toString()
  );

  const scenarioDetails = useForecastScenarioParams(
    portfolioNames,
    parameters.scenario
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  const debouncedParameterChange = useCallback(
    (newParameters: ForecastParameters) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onParametersChange(newParameters);
      }, 500);
    },
    [onParametersChange]
  );

  const handleMonthlyContributionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setMonthlyContributionInput(inputValue);

    const value = parseFloat(inputValue) || 0;
    debouncedParameterChange({ ...parameters, monthlyContribution: value });
  };

  const handleInflationRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setInflationRateInput(inputValue);

    const value = parseFloat(inputValue) / 100 || 0;
    debouncedParameterChange({ ...parameters, inflationRate: value });
  };

  return (
    <Accordion.Root type="single" collapsible className={styles.accordion}>
      <Accordion.Item value="parameters">
        <Accordion.Header className={styles.header}>
          <Accordion.Trigger className={styles.trigger}>
            <span>Forecast Parameters</span>
            <ChevronDown className={styles.chevron} />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={styles.content}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <span className={styles.label}>Time Horizon</span>
              <ToggleGroup>
                {Object.values(FORECAST_HORIZONS).map((interval) => (
                  <ToggleItem
                    key={interval}
                    value={interval}
                    selected={parameters.timeHorizon === interval}
                    onSelect={() =>
                      onParametersChange({
                        ...parameters,
                        timeHorizon: interval,
                      })
                    }
                  >
                    {interval}
                  </ToggleItem>
                ))}
              </ToggleGroup>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>Performance Scenario</span>
              <ToggleGroup>
                <ToggleItem
                  value="market"
                  selected={parameters.scenario === "market"}
                  onSelect={() =>
                    onParametersChange({ ...parameters, scenario: "market" })
                  }
                >
                  Market
                </ToggleItem>
                <ToggleItem
                  value="portfolio"
                  selected={parameters.scenario === "portfolio"}
                  onSelect={() =>
                    onParametersChange({ ...parameters, scenario: "portfolio" })
                  }
                >
                  Portfolio
                </ToggleItem>
              </ToggleGroup>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>Monthly Contributions</span>
              <div className={styles.inputAdornment}>
                <span className={styles.adornmentText}>€</span>
                <Input
                  type="number"
                  value={monthlyContributionInput}
                  onChange={handleMonthlyContributionChange}
                  min={0}
                  step={50}
                  className="w-[14ch]"
                />
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>Inflation Rate</span>
              <div className={styles.inputAdornment}>
                <Input
                  type="number"
                  value={inflationRateInput}
                  onChange={handleInflationRateChange}
                  min={0}
                  step={0.5}
                  className="w-[14ch]"
                />
                <span className={styles.adornmentText}>%</span>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>Confidence Interval</span>
              <div className={styles.displayOptions}>
                <ToggleGroup>
                  {Object.values(FORECAST_CONFIDENCE_LEVELS).map((conf) => (
                    <ToggleItem
                      key={conf}
                      value={conf.toString()}
                      selected={parameters.confidenceLevel === conf}
                      onSelect={() =>
                        onParametersChange({
                          ...parameters,
                          confidenceLevel: conf,
                        })
                      }
                    >
                      {`${conf}%`}
                    </ToggleItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>

          <div className={styles.scenarioDetails}>
            {scenarioDetails ? (
              <div>
                <p className="font-medium text-sm mb-1">
                  {`Forecast Scenario: ${scenarioDetails.displayInfo.name}`}
                </p>
                <p className="text-sm text-text-muted mb-2">
                  {scenarioDetails.displayInfo.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className={styles.chip}>
                    Annual Return: {scenarioDetails.displayInfo.annualReturn}
                  </span>
                  <span className={styles.chip}>
                    Volatility: {scenarioDetails.displayInfo.volatility}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.infoContainer}>
                <Info className={styles.infoIcon} />
                <span className="text-sm text-text-muted">
                  {parameters.scenario === "portfolio"
                    ? "Portfolio historical data insufficient for analysis"
                    : "Scenario parameters not available"}
                </span>
              </div>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

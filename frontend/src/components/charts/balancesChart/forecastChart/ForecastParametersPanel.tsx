import styled from "@emotion/styled";
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  debounce,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FC, useCallback, useState } from "react";
import {
  FORECAST_CONFIDENCE_LEVELS,
  FORECAST_HORIZONS,
  ForecastHorizon,
  ForecastParameters,
  ForecastScenario,
  useForecastScenarioParams,
} from "./ForecastChart.logic";
import styles from "./ForecastParametersPanel.module.less";

const StyledTextField = styled(TextField)`
  width: 14ch;
`;

const StyledScenarioTitle = styled(Typography)`
  margin-bottom: 4px;
`;

const StyledScenarioDescription = styled(Typography)`
  margin-bottom: 8px;
`;

const StyledChipContainer = styled(Box)`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const StyledInfoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface ForecastParametersPanelProps {
  portfolioName: string;
  parameters: ForecastParameters;
  onParametersChange: (parameters: ForecastParameters) => void;
}

export const ForecastParametersPanel: FC<ForecastParametersPanelProps> = ({
  portfolioName,
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
    portfolioName,
    parameters.scenario
  );

  const debouncedParameterChange = useCallback(
    debounce((newParameters: ForecastParameters) => {
      onParametersChange(newParameters);
    }, 500),
    [onParametersChange]
  );

  const handleScenarioChange = (
    _event: React.MouseEvent<HTMLElement>,
    newScenario: ForecastScenario | null
  ) => {
    if (newScenario !== null) {
      onParametersChange({ ...parameters, scenario: newScenario });
    }
  };

  const handleTimeHorizonChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTimeHorizon: ForecastHorizon | null
  ) => {
    if (newTimeHorizon !== null) {
      onParametersChange({ ...parameters, timeHorizon: newTimeHorizon });
    }
  };

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

  const handleConfidenceLevelChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLevel: ForecastParameters["confidenceLevel"] | null
  ) => {
    if (newLevel !== null) {
      onParametersChange({ ...parameters, confidenceLevel: newLevel });
    }
  };

  return (
    <Accordion className={styles.accordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="forecast-parameters-content"
        id="forecast-parameters-header"
      >
        <Typography variant="subtitle1">Forecast Parameters</Typography>
      </AccordionSummary>
      <AccordionDetails className={styles.content}>
        <Box className={styles.controlsGrid}>
          {/* Time Horizon */}
          <Box className={styles.controlGroup}>
            <Typography variant="body2" className={styles.label}>
              Time Horizon
            </Typography>
            <ToggleButtonGroup
              value={parameters.timeHorizon}
              exclusive
              onChange={handleTimeHorizonChange}
              aria-label="time horizon"
              size="small"
            >
              {Object.values(FORECAST_HORIZONS).map((interval) => (
                <ToggleButton
                  key={interval}
                  value={interval}
                  aria-label={interval}
                >
                  {interval}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Scenario */}
          <Box className={styles.controlGroup}>
            <Typography variant="body2" className={styles.label}>
              Performance Scenario
            </Typography>
            <ToggleButtonGroup
              value={parameters.scenario}
              exclusive
              onChange={handleScenarioChange}
              aria-label="investment scenario"
              size="small"
            >
              <ToggleButton value="market" aria-label="market">
                Market
              </ToggleButton>
              <ToggleButton value="portfolio" aria-label="portfolio">
                Portfolio
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Monthly Contributions */}
          <Box className={styles.controlGroup}>
            <Typography variant="body2" className={styles.label}>
              Monthly Contributions
            </Typography>
            <StyledTextField
              type="number"
              value={monthlyContributionInput}
              onChange={handleMonthlyContributionChange}
              size="small"
              slotProps={{
                htmlInput: { min: 0, step: 50 },
                input: { startAdornment: "€" },
              }}
            />
          </Box>

          {/* Inflation Rate */}
          <Box className={styles.controlGroup}>
            <Typography variant="body2" className={styles.label}>
              Inflation Rate
            </Typography>
            <StyledTextField
              type="number"
              value={inflationRateInput}
              onChange={handleInflationRateChange}
              size="small"
              slotProps={{
                htmlInput: { min: 0, step: 0.5 },
                input: { endAdornment: "%" },
              }}
            />
          </Box>

          {/* Confidence Band Options */}
          <Box className={styles.controlGroup}>
            <Typography variant="body2" className={styles.label}>
              Confidence Interval
            </Typography>
            <Box className={styles.displayOptions}>
              <ToggleButtonGroup
                value={parameters.confidenceLevel}
                exclusive
                onChange={handleConfidenceLevelChange}
                aria-label="confidence level"
                size="small"
              >
                {Object.values(FORECAST_CONFIDENCE_LEVELS).map((conf) => (
                  <ToggleButton
                    key={conf}
                    value={conf}
                    aria-label={`${conf} percent confidence`}
                  >
                    {`${conf}%`}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>

        {/* Scenario Details */}
        <Box className={styles.scenarioDetails}>
          {scenarioDetails ? (
            <Box>
              <StyledScenarioTitle variant="subtitle2">
                {`Forecast Scenario: ${scenarioDetails.displayInfo.name}`}
              </StyledScenarioTitle>
              <StyledScenarioDescription variant="body2" color="text.secondary">
                {scenarioDetails.displayInfo.description}
              </StyledScenarioDescription>
              <StyledChipContainer>
                <Chip
                  label={`Annual Return: ${scenarioDetails.displayInfo.annualReturn}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Volatility: ${scenarioDetails.displayInfo.volatility}`}
                  size="small"
                  variant="outlined"
                />
              </StyledChipContainer>
            </Box>
          ) : (
            <StyledInfoContainer>
              <InfoIcon color="disabled" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {parameters.scenario === "portfolio"
                  ? "Portfolio historical data insufficient for analysis"
                  : "Scenario parameters not available"}
              </Typography>
            </StyledInfoContainer>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

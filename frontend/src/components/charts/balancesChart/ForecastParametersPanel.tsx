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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FC } from "react";
import {
  FORECAST_CONFIDENCE_LEVELS,
  FORECAST_HORIZONS,
  ForecastHorizon,
  ForecastParameters,
  ForecastScenario,
  useForecastScenarioParams,
} from "./BalancesChart.logic";
import styles from "./ForecastParametersPanel.module.less";

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
  const scenarioDetails = useForecastScenarioParams(
    portfolioName,
    parameters.scenario
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
    const value = parseFloat(event.target.value) || 0;
    onParametersChange({ ...parameters, monthlyContribution: value });
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
            <Box className={styles.labelWithInfo}>
              <Typography variant="body2" className={styles.label}>
                Performance Scenario
              </Typography>
            </Box>
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
            <TextField
              type="number"
              value={parameters.monthlyContribution}
              onChange={handleMonthlyContributionChange}
              size="small"
              slotProps={{
                htmlInput: { min: 0, step: 50 },
                input: { startAdornment: "€" },
              }}
              sx={{ width: "14ch" }}
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
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {`Forecast Scenario: ${scenarioDetails.displayInfo.name}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {scenarioDetails.displayInfo.description}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon color="disabled" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {parameters.scenario === "portfolio"
                  ? "Portfolio historical data insufficient for analysis"
                  : "Scenario parameters not available"}
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

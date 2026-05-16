import { FC, useState } from "react";
import { Select } from "../../ui/Select";
import { ToggleGroup, ToggleItem } from "../../ui/ToggleGroup";
import { useBreakpoint } from "../../../theme/breakpoints";
import { ChartRange } from "../chartRange.types";
import { ChartRangeSelector } from "../ChartRangeSelector";
import { Heading } from "../../ui/Heading";
import { styles } from "./BalancesChart.styles";
import { ForecastChart } from "./forecastChart/ForecastChart";
import { ProfitChart } from "./profitChart/ProfitChart";
import { ViewMode } from "./shared/balancesChart.types";
import { TotalValueChart } from "./totalValueChart/TotalValueChart";

const SubChartComponents: Record<
  ViewMode,
  FC<{ portfolioNames: string[]; range: ChartRange }>
> = {
  total: TotalValueChart,
  profitLoss: ProfitChart,
  forecast: ForecastChart,
};

export const PortfolioBalancesChart: FC<{ portfolioNames: string[] }> = ({
  portfolioNames,
}) => {
  const { isMobile } = useBreakpoint();
  const [viewMode, setViewMode] = useState<ViewMode>("total");
  const [range, setRange] = useState<ChartRange>("Max");

  const SubChart = SubChartComponents[viewMode];
  const showRangeSelector = viewMode !== "forecast";

  const handleSelect = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "total" || value === "profitLoss" || value === "forecast") {
      setViewMode(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headingContainer}>
        <Heading level="h1">Balances</Heading>
        <div className={styles.controls}>
          {showRangeSelector && (
            <ChartRangeSelector value={range} onChange={setRange} />
          )}
          {isMobile ? (
            <Select
              name="chart-view-mode"
              value={viewMode}
              onChange={handleMobileChange}
            >
              <option value="total">Total Value</option>
              <option value="profitLoss">Profit / Loss</option>
              <option value="forecast">Forecast</option>
            </Select>
          ) : (
            <ToggleGroup aria-label="chart view mode">
              <ToggleItem
                value="total"
                selected={viewMode === "total"}
                onSelect={handleSelect}
                aria-label="total value"
              >
                Total Value
              </ToggleItem>
              <ToggleItem
                value="profitLoss"
                selected={viewMode === "profitLoss"}
                onSelect={handleSelect}
                aria-label="profit/loss"
              >
                Profit / Loss
              </ToggleItem>
              <ToggleItem
                value="forecast"
                selected={viewMode === "forecast"}
                onSelect={handleSelect}
                aria-label="forecast"
              >
                Forecast
              </ToggleItem>
            </ToggleGroup>
          )}
        </div>
      </div>
      <SubChart portfolioNames={portfolioNames} range={range} />
    </div>
  );
};

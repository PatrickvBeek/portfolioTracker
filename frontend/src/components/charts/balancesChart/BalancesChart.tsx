import { FC, useState } from "react";
import { ToggleGroup, ToggleItem } from "../../ui/ToggleGroup";
import { useBreakpoint } from "../../../theme/breakpoints";
import { styles } from "./BalancesChart.styles";
import { ForecastChart } from "./forecastChart/ForecastChart";
import { ProfitChart } from "./profitChart/ProfitChart";
import { ViewMode } from "./shared/balancesChart.types";
import { TotalValueChart } from "./totalValueChart/TotalValueChart";

export const PortfolioBalancesChart: FC<{ portfolioNames: string[] }> = ({
  portfolioNames,
}) => {
  const { isMobile } = useBreakpoint();
  const [viewMode, setViewMode] = useState<ViewMode>("total");

  const ChartsComponents: Record<ViewMode, FC<{ portfolioNames: string[] }>> = {
    total: TotalValueChart,
    profitLoss: ProfitChart,
    forecast: ForecastChart,
  };

  const SubChart = ChartsComponents[viewMode];

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
        {isMobile ? (
          <select
            value={viewMode}
            onChange={handleMobileChange}
            className="w-full px-3 py-2.5 rounded-md text-sm bg-bg-input border border-border text-text focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors duration-150"
          >
            <option value="total">Total Value</option>
            <option value="profitLoss">Profit / Loss</option>
            <option value="forecast">Forecast</option>
          </select>
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
      {<SubChart portfolioNames={portfolioNames} />}
    </div>
  );
};

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FC, useState } from "react";
import { Headline } from "../../general/headline/Headline";
import styles from "./BalancesChart.module.less";
import { ForecastChart } from "./forecastChart/ForecastChart";
import { ProfitChart } from "./profitChart/ProfitChart";
import { ViewMode } from "./shared/balancesChart.types";
import { TotalValueChart } from "./totalValueChart/TotalValueChart";

export const PortfolioBalancesChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("total");

  const ChartsComponents: Record<ViewMode, FC<{ portfolioName: string }>> = {
    total: TotalValueChart,
    profitLoss: ProfitChart,
    forecast: ForecastChart,
  };

  const SubChart = ChartsComponents[viewMode];

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headingContainer}>
        <Headline text={"Balances"} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="chart view mode"
          size="small"
          color="primary"
        >
          <ToggleButton value="total" aria-label="total value">
            Total Value
          </ToggleButton>
          <ToggleButton value="profitLoss" aria-label="profit/loss">
            Profit / Loss
          </ToggleButton>
          <ToggleButton value="forecast" aria-label="forecast">
            Forecast
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {<SubChart portfolioName={portfolioName} />}
    </div>
  );
};

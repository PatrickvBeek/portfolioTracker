import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import moment from "moment";
import { FC, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Headline } from "../../general/headline/Headline";
import { ChartContainer } from "../ChartContainer";
import { getSplitColorGradientDef } from "../chartElements";
import {
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  BalancesChartDataSets,
  useGetPortfolioHistoryChartData,
  useProfitHistory,
} from "./BalancesChart.logic";
import styles from "./BalancesChart.module.less";

type ViewMode = "total" | "profitLoss";

const TotalValueChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
  const { data, isLoading } = useGetPortfolioHistoryChartData(portfolioName);

  const chartData = data || [];

  return (
    <ChartContainer isLoading={isLoading}>
      <LineChart data={chartData}>
        <Legend />
        <XAxis {...getTimeAxisProps(chartData)} />
        <YAxis
          {...getAxisProps(chartData)}
          tickFormatter={(value) => Number(value / 1000).toString()}
          unit={" k€"}
        />
        <CartesianGrid stroke="#ccc" />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"cashFlow" satisfies BalancesChartDataSets}
          name={"Cash Flow"}
          stroke="var(--theme-highlight)"
          strokeOpacity={chartData.length ? 1 : 0.5}
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"buyValue" satisfies BalancesChartDataSets}
          name={"Buy Value"}
          stroke="var(--orange)"
          strokeOpacity={chartData.length ? 1 : 0.5}
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"marketValue" satisfies BalancesChartDataSets}
          name={"Market Value"}
          stroke="var(--green)"
          type={"linear"}
          strokeOpacity={chartData.length ? 1 : 0.5}
        />
        <Tooltip
          formatter={(value, name) => [
            Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }) + " €",
            name,
          ]}
          labelFormatter={(value: number) =>
            moment(new Date(value)).format("ddd DD.MM.YYYY")
          }
        />
      </LineChart>
    </ChartContainer>
  );
};

const ProfitChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
  const { isLoading, data } = useProfitHistory(portfolioName);

  const chartData = data ?? [];

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    chartData,
    "value"
  );

  return (
    <ChartContainer isLoading={isLoading}>
      <AreaChart data={chartData}>
        <Legend />
        <XAxis {...getTimeAxisProps(chartData)} />
        <YAxis
          {...getAxisProps(chartData, 5, false)}
          tickFormatter={(value) => Number(value / 1000).toString()}
          unit={" k€"}
        />
        <CartesianGrid stroke="#ccc" />
        {gradientDefinition}
        <Area
          {...DEFAULT_LINE_PROPS}
          strokeWidth={2}
          type="linear"
          dataKey={"value"}
          name="Profit"
          stroke={strokeUrl}
          fill={fillUrl}
          fillOpacity={1}
        />
        <Tooltip
          formatter={(value, name) => [
            Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }) + " €",
            name,
          ]}
          labelFormatter={(value: number) =>
            moment(new Date(value)).format("ddd DD.MM.YYYY")
          }
        />
      </AreaChart>
    </ChartContainer>
  );
};

export const PortfolioBalancesChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("total");

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
        </ToggleButtonGroup>
      </div>

      {viewMode === "total" ? (
        <TotalValueChart portfolioName={portfolioName} />
      ) : (
        <ProfitChart portfolioName={portfolioName} />
      )}
    </div>
  );
};

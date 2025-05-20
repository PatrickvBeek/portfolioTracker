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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULT_LINE_PROPS,
  calculateGradientOffset,
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
  const chartData = useGetPortfolioHistoryChartData(portfolioName);

  if (!chartData.length) {
    return null;
  }

  return (
    <ResponsiveContainer aspect={2.5} width={"100%"}>
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
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"buyValue" satisfies BalancesChartDataSets}
          name={"Buy Value"}
          stroke="var(--orange)"
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"marketValue" satisfies BalancesChartDataSets}
          name={"Market Value"}
          stroke="var(--green)"
          type={"linear"}
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
    </ResponsiveContainer>
  );
};

const ProfitChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
  const { isLoading, data: chartData } = useProfitHistory(portfolioName);

  if (isLoading || !chartData) {
    return null;
  }

  const offset = calculateGradientOffset(chartData, "value");

  return (
    <ResponsiveContainer aspect={2.5} width={"100%"}>
      <AreaChart data={chartData}>
        <Legend />
        <XAxis {...getTimeAxisProps(chartData)} />
        <YAxis
          {...getAxisProps(chartData, 5, false)}
          tickFormatter={(value) => Number(value / 1000).toString()}
          unit={" k€"}
        />
        <CartesianGrid stroke="#ccc" />
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offset} stopColor="var(--green)" stopOpacity={1} />
            <stop offset={offset} stopColor="var(--red)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Area
          {...DEFAULT_LINE_PROPS}
          strokeWidth={2}
          type="linear"
          dataKey={"value"}
          name="Profit"
          stroke="url(#splitColor)"
          fill="url(#splitColor)"
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
    </ResponsiveContainer>
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
        <div className={styles.heading}>Balances</div>
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

import moment from "moment";
import { FC } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "../../ChartContainer";
import {
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import {
  BalancesChartDataSets,
  useGetPortfolioHistoryChartData,
} from "./TotalValueChart.logic";

export const TotalValueChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const { data, isLoading } = useGetPortfolioHistoryChartData(portfolioName);

  const chartData = data || [];

  return (
    <ChartContainer isLoading={isLoading}>
      <LineChart data={chartData}>
        <Legend verticalAlign="bottom" />
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

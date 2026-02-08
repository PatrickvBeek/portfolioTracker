import moment from "moment";
import { FC } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "../../ChartContainer";
import { getSplitColorGradientDef } from "../../chartElements";
import {
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import { useProfitHistory } from "./ProfitChart.logic";

export const ProfitChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const { isLoading, data } = useProfitHistory(portfolioName);

  const chartData = data ?? [];

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    chartData,
    "value"
  );

  return (
    <ChartContainer isLoading={isLoading}>
      <AreaChart data={chartData}>
        <Legend verticalAlign="bottom" />
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

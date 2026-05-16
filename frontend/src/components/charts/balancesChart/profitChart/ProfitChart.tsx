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
import { ChartRange } from "../../chartRange.types";
import {
  DEFAULT_LINE_PROPS,
  filterChartDataByRange,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import { useProfitHistory } from "./ProfitChart.logic";

export const ProfitChart: FC<{
  portfolioNames: string[];
  range: ChartRange;
}> = ({ portfolioNames, range }) => {
  const { isLoading, data } = useProfitHistory(portfolioNames);

  const chartData = filterChartDataByRange(data ?? [], range);

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    chartData,
    "value"
  );

  return (
    <div>
      <ChartContainer isLoading={isLoading}>
        <AreaChart data={chartData} margin={{ bottom: 30 }}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData)}
            tickFormatter={(value) => (value / 1000).toString()}
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
            labelFormatter={(value) =>
              moment(new Date(Number(value))).format("ddd DD.MM.YYYY")
            }
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

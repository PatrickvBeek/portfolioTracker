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
import { ChartRange } from "../../chartRange.types";
import {
  DEFAULT_LINE_PROPS,
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import {
  BalancesChartDataSets,
  useGetPortfolioHistoryChartData,
} from "./TotalValueChart.logic";

export const TotalValueChart: FC<{
  portfolioNames: string[];
  range: ChartRange;
}> = ({ portfolioNames, range }) => {
  const { data, isLoading } = useGetPortfolioHistoryChartData(
    portfolioNames,
    range
  );

  return (
    <div>
      <ChartContainer isLoading={isLoading}>
        <LineChart data={data || []} margin={{ bottom: 30 }}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(data || [])} />
          <YAxis
            {...getAxisProps(data || [])}
            tickFormatter={(value) => (value / 1000).toString()}
            unit={" k€"}
          />
          <CartesianGrid stroke={CHART_GRID_STROKE} />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"cashFlow" satisfies BalancesChartDataSets}
            name={"Cash Flow"}
            stroke="var(--color-accent-hover)"
            strokeOpacity={data?.length ? 1 : 0.5}
          />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"buyValue" satisfies BalancesChartDataSets}
            name={"Buy Value"}
            stroke="var(--color-warning)"
            strokeOpacity={data?.length ? 1 : 0.5}
          />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"marketValue" satisfies BalancesChartDataSets}
            name={"Market Value"}
            stroke="var(--color-success)"
            type={"linear"}
            strokeOpacity={data?.length ? 1 : 0.5}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
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
        </LineChart>
      </ChartContainer>
    </div>
  );
};

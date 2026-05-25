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
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import { useProfitHistory } from "./ProfitChart.logic";

export const ProfitChart: FC<{
  portfolioNames: string[];
  range: ChartRange;
}> = ({ portfolioNames, range }) => {
  const { isLoading, data } = useProfitHistory(portfolioNames, range);

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    data ?? [],
    "value"
  );

  return (
    <div>
      <ChartContainer isLoading={isLoading}>
        <AreaChart data={data ?? []} margin={{ bottom: 30 }}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(data ?? [])} />
          <YAxis
            {...getAxisProps(data ?? [])}
            tickFormatter={(value) => (value / 1000).toString()}
            unit={" k€"}
          />
          <CartesianGrid stroke={CHART_GRID_STROKE} />
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
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

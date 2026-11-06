import { isArray } from "radash";
import { ReactNode } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  asLocaleEuro,
  CHART_GRID_STROKE,
  DEFAULT_LINE_PROPS,
  getTimeAxisProps,
  TOOLTIP_STYLE,
} from "./chartUtils";
import {
  ForecastChartData,
  ForecastChartDataSets,
  getForecastYAxisProps,
} from "./forecastChartUtils";

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
});

export interface ForecastChartLabels {
  band: string;
  median: string;
  cashFlow?: string;
}

export const ForecastChartBody = ({
  data,
  labels,
  children,
}: {
  data: ForecastChartData;
  labels: ForecastChartLabels;
  children?: ReactNode;
}) => {
  const hasCashFlow = labels.cashFlow !== undefined;

  return (
    <ComposedChart data={data} margin={{ bottom: 30 }}>
      <Legend verticalAlign="bottom" />
      <XAxis {...getTimeAxisProps(data)} />
      <YAxis
        {...getForecastYAxisProps(data, { includeCashFlow: hasCashFlow })}
        width="auto"
        allowDataOverflow
      />
      <CartesianGrid stroke={CHART_GRID_STROKE} />

      <Area
        {...DEFAULT_LINE_PROPS}
        dataKey="uncertaintyBand"
        type="monotone"
        stroke="var(--color-success)"
        strokeWidth={0}
        fill="var(--color-success-soft)"
        connectNulls
        name={labels.band}
      />

      {labels.cashFlow !== undefined && (
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"cashFlow" satisfies ForecastChartDataSets}
          name={labels.cashFlow}
          stroke="var(--color-accent-hover)"
          strokeDasharray="8 4"
          strokeWidth={2}
        />
      )}

      <Line
        {...DEFAULT_LINE_PROPS}
        dataKey={"median" satisfies ForecastChartDataSets}
        name={labels.median}
        stroke="var(--color-success)"
        strokeDasharray="8 4"
        strokeWidth={2}
        type={"linear"}
      />

      <Tooltip
        contentStyle={TOOLTIP_STYLE}
        formatter={(value, name) =>
          isArray(value)
            ? [
                `${asLocaleEuro(value[0], 0)} - ${asLocaleEuro(value[1], 0)}`,
                name,
              ]
            : [asLocaleEuro(Number(value), 0), name]
        }
        labelFormatter={(value) => MONTH_YEAR_FORMATTER.format(Number(value))}
      />
      {children}
    </ComposedChart>
  );
};

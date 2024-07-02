import moment from "moment";
import { ReactElement } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { getAxisProps, getTimeAxisProps } from "../axisUtils";
import "./InitialValueHistoryChart.css";
import { useGetInitialValueSeries } from "./InitialValueHistoryChart.logic";

const { bemElement, bemBlock } = bemHelper("initial-value-history-chart");

export type InitialValueHistoryChartProps = Props<{
  portfolioName: string;
}>;

export function InitialValueHistoryChart({
  portfolioName,
  className,
}: InitialValueHistoryChartProps): ReactElement | null {
  const initialValueSeries = useGetInitialValueSeries(portfolioName);

  if (!initialValueSeries?.length) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Initial Value History</div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <AreaChart data={initialValueSeries}>
          <Area
            type={"stepAfter"}
            stroke="var(--theme-highlight)"
            strokeWidth={3}
            dataKey={"value"}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2) + " €"]}
            labelFormatter={(value: number) =>
              moment(new Date(value)).format("ddd DD.MM.YYYY")
            }
          />
          <XAxis
            dataKey={"timestamp"}
            {...getTimeAxisProps(initialValueSeries.map((p) => p.timestamp))}
          />
          <YAxis {...getAxisProps(initialValueSeries.map((d) => d.value))} />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

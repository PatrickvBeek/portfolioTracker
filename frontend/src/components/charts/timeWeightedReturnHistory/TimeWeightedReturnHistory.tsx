import moment from "moment";
import { getHistoryPointMapper } from "pt-domain/src/portfolioHistory/history.derivers";
import { FC } from "react";
import {
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
  DEFAULT_AREA_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import { useTimeWeightedReturnHistory } from "./TimeWeightedReturn.logic";

export const TimeWeightedReturnHistory: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const twrHistoryQuery = useTimeWeightedReturnHistory(portfolioName);
  const chartData = (twrHistoryQuery?.data || []).map(
    getHistoryPointMapper((value) => (value - 1) * 100)
  );

  return (
    <ResponsiveContainer aspect={2.5} width={"100%"}>
      <LineChart data={chartData}>
        <Legend />
        <Line
          {...DEFAULT_AREA_PROPS}
          type={"linear"}
          dataKey={"value"}
          name={"Time Weighted Return"}
          stroke="var(--theme-highlight)"
        />

        <Tooltip
          formatter={(value, name) => [
            Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            }) + " %",
            name,
          ]}
          labelFormatter={(value: number) =>
            moment(new Date(value)).format("ddd DD.MM.YYYY")
          }
        />
        <XAxis {...getTimeAxisProps(chartData)} />
        <YAxis
          {...getAxisProps(chartData, 5, false)}
          tickFormatter={(value) => Number(value).toFixed(0)}
          unit={" %"}
        />
        <CartesianGrid stroke="#ccc" />
      </LineChart>
    </ResponsiveContainer>
  );
};

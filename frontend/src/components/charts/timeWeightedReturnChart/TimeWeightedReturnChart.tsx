import moment from "moment";
import { FC, useState } from "react";
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
import AssetDropdown from "../../Assets/AssetDropdown/AssetSelect";
import { Headline } from "../../general/headline/Headline";
import {
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  PerformanceChartDataSets,
  usePerformanceChartData,
} from "./TimeWeightedReturnChart.logic";
import styles from "./TimeWeightedReturnChart.module.less";

export const TimeWeightedReturnChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const [benchmark, setBenchmark] = useState("");
  const chartData =
    usePerformanceChartData(portfolioName, benchmark).data || [];

  return (
    <div>
      <div className={styles.header}>
        <Headline text={"Performance: Time Weighted Return"} />
        <AssetDropdown
          onChange={(isin) => setBenchmark(isin || "")}
          label="Benchmark"
          className={styles.benchmark_select}
          filterAssets={(a) => !!a.symbol}
        />
      </div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <LineChart data={chartData}>
          <Legend />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData, 5, false)}
            tickFormatter={(value) => Number(value).toFixed(0)}
            unit={" %"}
          />
          <CartesianGrid stroke="#ccc" />
          <Line
            {...DEFAULT_LINE_PROPS}
            type={"linear"}
            dataKey={"portfolio" satisfies PerformanceChartDataSets}
            name={"Your Portfolio"}
            stroke="var(--theme-highlight)"
          />
          {benchmark ? (
            <Line
              {...DEFAULT_LINE_PROPS}
              type={"linear"}
              dataKey={"benchmark" satisfies PerformanceChartDataSets}
              name={"Benchmark"}
              strokeOpacity={0.55}
              stroke="grey"
            />
          ) : null}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

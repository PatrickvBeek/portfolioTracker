import moment from "moment";
import { FC, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AssetDropdown from "../../Assets/AssetDropdown/AssetSelect";
import { Headline } from "../../general/headline/Headline";
import { ChartContainer } from "../ChartContainer";
import { getSplitColorGradientDef } from "../chartElements";
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
  const { isLoading, data } = usePerformanceChartData(portfolioName, benchmark);

  const chartData = data || [];

  const { gradientDefinition, fillUrl, strokeUrl } = getSplitColorGradientDef(
    chartData,
    "portfolio"
  );

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
      <ChartContainer isLoading={isLoading}>
        <AreaChart data={chartData}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData, 5, false)}
            tickFormatter={(value) => Number(value).toFixed(0)}
            unit={" %"}
          />
          <CartesianGrid stroke="#ccc" />
          {gradientDefinition}
          <Area
            {...DEFAULT_LINE_PROPS}
            type={"linear"}
            dataKey={"portfolio" satisfies PerformanceChartDataSets}
            name={"Your Portfolio"}
            stroke={strokeUrl}
            fill={fillUrl}
            fillOpacity={1}
          />
          {benchmark ? (
            <Area
              {...DEFAULT_LINE_PROPS}
              type={"linear"}
              dataKey={"benchmark" satisfies PerformanceChartDataSets}
              name={"Benchmark"}
              strokeOpacity={0.55}
              stroke="grey"
              fillOpacity={0}
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
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

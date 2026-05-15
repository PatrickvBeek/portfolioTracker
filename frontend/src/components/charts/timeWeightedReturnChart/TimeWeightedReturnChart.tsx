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
import { Heading } from "../../ui/Heading";
import { ChartContainer } from "../ChartContainer";
import { getSplitColorGradientDef } from "../chartElements";
import { ChartRange } from "../chartRange.types";
import { ChartRangeSelector } from "../ChartRangeSelector";
import {
  DEFAULT_LINE_PROPS,
  filterChartDataByRange,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  PerformanceChartDataSets,
  usePerformanceChartData,
} from "./TimeWeightedReturnChart.logic";
import { styles } from "./TimeWeightedReturnChart.styles";

export const TimeWeightedReturnChart: FC<{ portfolioNames: string[] }> = ({
  portfolioNames,
}) => {
  const [benchmark, setBenchmark] = useState("");
  const [range, setRange] = useState<ChartRange>("Max");
  const { isLoading, data } = usePerformanceChartData(
    portfolioNames,
    benchmark
  );

  const chartData = filterChartDataByRange(data || [], range);

  const { gradientDefinition, fillUrl, strokeUrl } = getSplitColorGradientDef(
    chartData,
    "portfolio"
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading level="h1">Time Weighted Return</Heading>
        <div className={styles.controls}>
          <ChartRangeSelector value={range} onChange={setRange} />
          <AssetDropdown
            onChange={(isin) => setBenchmark(isin || "")}
            placeholder="Benchmark"
            className={styles.benchmarkSelect}
            filterAssets={(a) => !!a.symbol}
          />
        </div>
      </div>
      <ChartContainer isLoading={isLoading}>
        <AreaChart data={chartData} margin={{ bottom: 30 }}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData)}
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
            labelFormatter={(value) =>
              moment(new Date(Number(value))).format("ddd DD.MM.YYYY")
            }
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

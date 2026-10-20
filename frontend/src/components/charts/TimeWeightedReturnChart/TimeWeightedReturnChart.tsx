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
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  PerformanceChartDataSets,
  TwrMode,
  usePerformanceChartData,
} from "./TimeWeightedReturnChart.logic";
import { styles } from "./TimeWeightedReturnChart.styles";
import { TwrModeSelector } from "./TwrModeSelector";

export const TimeWeightedReturnChart: FC<{ portfolioNames: string[] }> = ({
  portfolioNames,
}) => {
  const [benchmark, setBenchmark] = useState("");
  const [range, setRange] = useState<ChartRange>("Max");
  const [twrMode, setTwrMode] = useState<TwrMode>("nominal");
  const { isLoading, data } = usePerformanceChartData(
    portfolioNames,
    benchmark,
    range,
    twrMode
  );

  const { gradientDefinition, fillUrl, strokeUrl } = getSplitColorGradientDef(
    data || [],
    "portfolio"
  );

  return (
    <div className={styles.container}>
      <div className={styles.sectionBody}>
        <div className={styles.header}>
          <Heading level="section">Time Weighted Return</Heading>
          <div className={styles.controls}>
            <ChartRangeSelector value={range} onChange={setRange} />
            <TwrModeSelector value={twrMode} onChange={setTwrMode} />
            <div className={styles.benchmarkSelect}>
              <AssetDropdown
                onChange={(isin) => setBenchmark(isin || "")}
                placeholder="Benchmark"
                filterAssets={(a) => !!a.symbol}
              />
            </div>
          </div>
        </div>
        <ChartContainer isLoading={isLoading}>
          <AreaChart data={data || []} margin={{ bottom: 30 }}>
            <Legend verticalAlign="bottom" />
            <XAxis {...getTimeAxisProps(data || [])} />
            <YAxis
              {...getAxisProps(data || [])}
              tickFormatter={(value) => Number(value).toFixed(0)}
              unit={" %"}
            />
            <CartesianGrid stroke={CHART_GRID_STROKE} />
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
                stroke="var(--color-text-dim)"
                fillOpacity={0}
              />
            ) : null}
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
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
    </div>
  );
};

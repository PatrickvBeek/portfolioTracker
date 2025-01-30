import { extent as d3Extent } from "d3-array";
import {
  scaleLinear as d3LinearScale,
  scaleTime as d3ScaleTime,
} from "d3-scale";
import { isNumber, omit } from "radash";
import { XAxisProps, YAxisProps } from "recharts";
import { ChartData } from "./chartTypes";

export function getAxisProps(
  chartData: ChartData<string>,
  nTicks: number = 5
): Partial<YAxisProps> {
  const values = chartData
    .map((point) => Object.values(omit(point, ["timestamp"])))
    .flat()
    .filter(isNumber);
  const domain = d3Extent(values) as [number, number];
  const scale = d3LinearScale(values).domain(domain).range([0, 1]);

  return {
    tickFormatter: scale.tickFormat(nTicks),
    ticks: scale.ticks(nTicks),
    type: "number",
    domain: [0, (m: number) => 1.05 * m],
  };
}

export function getTimeAxisProps(
  chartData: ChartData<string>,
  nTicks: number = 5
): Partial<XAxisProps> {
  const dates = chartData.map((point) => point.timestamp);
  const domain = d3Extent(dates) as [number, number];
  const tScale = d3ScaleTime().domain(domain).range([0, 1]);

  return {
    dataKey: "timestamp",
    tickFormatter: tScale.tickFormat(nTicks),
    ticks: tScale.ticks(nTicks).map((tick) => tick.getTime()),
    type: "number",
    domain: defaultDateDomain,
  };
}

const defaultDateDomain = ([dataMin, dataMax]: [number, number]): [
  number,
  number,
] => [dataMin, dataMax + 0.05 * (dataMax - dataMin)];

import { extent as d3Extent } from "d3-array";
import {
  scaleLinear as d3LinearScale,
  scaleTime as d3ScaleTime,
} from "d3-scale";
import { XAxisProps, YAxisProps } from "recharts";

export function getAxisProps(
  values: number[],
  nTicks: number = 5,
): Partial<YAxisProps> {
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
  dates: number[],
  nTicks: number = 5,
): Partial<XAxisProps> {
  const domain = d3Extent(dates) as [number, number];
  const tScale = d3ScaleTime().domain(domain).range([0, 1]);

  return {
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

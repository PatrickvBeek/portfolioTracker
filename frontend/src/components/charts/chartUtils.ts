import { extent as d3Extent } from "d3-array";
import {
  scaleLinear as d3LinearScale,
  scaleTime as d3ScaleTime,
} from "d3-scale";
import moment from "moment";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { isNumber, omit, range, sort, unique } from "radash";
import { XAxisProps, YAxisProps } from "recharts";
import { ChartData, ChartDataPoint } from "./chartTypes";

const MARGIN = 0.05;

export function getAxisProps(
  chartData: ChartData<string>,
  nTicks: number = 5,
  zeroBased = true
): Partial<YAxisProps> {
  const values = chartData
    .map((point) => Object.values(omit(point, ["timestamp"])))
    .flat()
    .filter(isNumber);
  const domain = d3Extent(values) as [number, number];
  const scale = d3LinearScale(values).domain(domain).range([0, 1]);

  const [yMin, yMax] = domain;
  const diff = yMax - yMin;

  return {
    tickFormatter: scale.tickFormat(nTicks),
    ticks: scale.ticks(nTicks),
    type: "number",
    domain: [zeroBased ? 0 : yMin - MARGIN * diff, yMax + MARGIN * diff],
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
] => [
  dataMin - 0.5 * MARGIN * (dataMax - dataMin),
  dataMax + 0.5 * MARGIN * (dataMax - dataMin),
];

export const historiesToChartData = <Keys extends string>(
  datasets: { history: History<number>; newKey: Keys }[]
): ChartDataPoint<Keys>[] => {
  const map = new Map<number, ChartDataPoint<Keys>>();

  datasets.forEach((dataset) => {
    dataset.history.forEach((point) => {
      const startOfDayTimestamp = moment(point.timestamp)
        .startOf("day")
        .valueOf();

      if (!map.has(startOfDayTimestamp)) {
        map.set(startOfDayTimestamp, {
          timestamp: startOfDayTimestamp,
        } as ChartDataPoint<Keys>);
      }
      map.get(startOfDayTimestamp)![dataset.newKey] =
        point.value as ChartDataPoint<Keys>[Keys];
    });
  });

  return sort(Array.from(map.values()), (p) => p.timestamp);
};

export const DEFAULT_LINE_PROPS = {
  dot: false,
  type: "stepAfter",
  connectNulls: true,
  strokeWidth: 3,
  animationDuration: 300,
} as const;

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const getDefaultTimeAxis = (xMin: number) =>
  unique(
    Array.from(range(xMin, Date.now(), (i) => i, 7 * DAY_IN_MS)).concat(
      Date.now()
    )
  );

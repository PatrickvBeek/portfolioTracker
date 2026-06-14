import { extent as d3Extent } from "d3-array";
import {
  scaleLinear as d3LinearScale,
  scaleTime as d3ScaleTime,
} from "d3-scale";
import moment from "moment";
import { History } from "pt-domain";
import { isNumber, omit, range, sort, unique } from "radash";
import { XAxisProps, YAxisProps } from "recharts";
import { CHART_RANGE_DAYS, ChartRange } from "./chartRange.types";
import { ChartData, ChartDataPoint } from "./chartTypes";

const MARGIN = 0.05;

export const CHART_GRID_STROKE = "var(--color-border)";

export const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--color-bg-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  color: "var(--color-text)",
};

export function getAxisProps(
  chartData: ChartData<string>,
  nTicks: number = 5
): Partial<YAxisProps> {
  const values = chartData
    .map((point) => Object.values(omit(point, ["timestamp"])))
    .flat(2)
    .filter(isNumber);
  const domain = d3Extent(values);
  if (domain[0] === undefined || domain[1] === undefined) {
    return { type: "number" };
  }
  const scale = d3LinearScale(values).domain(domain).range([0, 1]);

  const [yMin, yMax] = domain;
  const diff = yMax - yMin;

  return {
    tick: { fill: "var(--color-text)" },
    tickFormatter: scale.tickFormat(nTicks),
    ticks: scale.ticks(nTicks),
    type: "number",
    domain: [yMin - MARGIN * diff, yMax + MARGIN * diff],
  };
}

export function getTimeAxisProps(
  chartData: ChartData<string>,
  nTicks: number = 5
): Partial<XAxisProps> {
  const dates = chartData.map((point) => point.timestamp);
  const domain = d3Extent(dates);
  if (domain[0] === undefined || domain[1] === undefined) {
    return { dataKey: "timestamp", type: "number" };
  }
  const tScale = d3ScaleTime().domain(domain).range([0, 1]);

  return {
    dataKey: "timestamp",
    tick: { fill: "var(--color-text)" },
    tickFormatter: tScale.tickFormat(nTicks),
    ticks: tScale.ticks(nTicks).map((tick) => tick.getTime()),
    type: "number",
    domain: defaultDateDomain,
  };
}

const defaultDateDomain = ([dataMin, dataMax]: readonly [number, number]): [
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
        // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion incremental object building with generic keys
        map.set(startOfDayTimestamp, {
          timestamp: startOfDayTimestamp,
        } as ChartDataPoint<Keys>);
      }
      map.get(startOfDayTimestamp)![dataset.newKey] =
        // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion incremental object building with generic keys
        point.value as ChartDataPoint<Keys>[Keys];
    });
  });

  return sort(Array.from(map.values()), (p) => p.timestamp);
};

export const DEFAULT_LINE_PROPS = {
  dot: false,
  type: "stepAfter",
  connectNulls: true,
  strokeWidth: 2,
  animationDuration: 300,
} as const;

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const DAILY_THRESHOLD_DAYS = 365;

export const getRangeStart = (xMin: number, range: ChartRange): number => {
  const days = CHART_RANGE_DAYS[range];
  return days !== null ? Math.max(xMin, Date.now() - days * DAY_IN_MS) : xMin;
};

export const getDefaultTimeAxis = (xMin: number, chartRange: ChartRange) => {
  const rangeStart = getRangeStart(xMin, chartRange);

  const effectiveSpanDays = (Date.now() - rangeStart) / DAY_IN_MS;
  const step =
    effectiveSpanDays <= DAILY_THRESHOLD_DAYS ? DAY_IN_MS : 7 * DAY_IN_MS;

  return unique(
    Array.from(range(rangeStart, Date.now(), (i) => i, step)).concat(Date.now())
  );
};

export function calculateGradientOffset<T>(
  data: T[],
  valueKey: keyof T,
  options?: { baseline?: number }
): number {
  const baseline = options?.baseline ?? 0;
  const values = data.map((item) => Number(item[valueKey]) || 0);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);

  if (dataMax <= baseline) {
    return 0;
  }
  if (dataMin >= baseline) {
    return 1;
  }

  return (dataMax - baseline) / (dataMax - dataMin);
}

const asLocale = (value: number | string, digits: number): string =>
  new Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const asLocaleEuro = (value: number | string, digits: number): string =>
  `${asLocale(value, digits)} €`;

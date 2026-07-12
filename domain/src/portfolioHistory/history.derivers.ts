import { group, select, sum, unique } from "radash";
import { Batches } from "../batch/batch.entities";
import { percentage2rel, rel2percentage } from "../utils/percent";
import { History, HistoryPoint } from "./history.entities";

export const differentiateNumberHistory = (
  history: History<number>
): History<number> => {
  if (history.length < 2) {
    return history;
  }
  const [first, ...rest] = history;
  const diff = [first];
  let prevPoint = first;

  for (const point of rest) {
    const newPoint = {
      timestamp: point.timestamp,
      value: point.value - prevPoint.value,
    };
    prevPoint = point;
    diff.push(newPoint);
  }

  return diff;
};

export const getHistoryPointMapper =
  <T, U>(valueMapper: (el: T) => U) =>
  (point: HistoryPoint<T>): HistoryPoint<U> => ({
    timestamp: point.timestamp,
    value: valueMapper(point.value),
  });

export const getHistoryMapper =
  <T, U>(mapper: (el: T) => U) =>
  (history: History<T>): History<U> =>
    history.map(getHistoryPointMapper(mapper));

export const removeDuplicatesAtSameTimeStamp = <T>(series: History<T>) =>
  unique(series.toReversed(), (dataPoint) => dataPoint.timestamp).toReversed();

export const pickValueFromHistory = <T>(history: History<T>, t: number) =>
  history.findLast((point) => point.timestamp <= t);

export const getPiecesAtTimeStamp = (
  batchesHistory: History<Batches>,
  timeStampOfInterest: number
): number =>
  sum(
    pickValueFromHistory(batchesHistory, timeStampOfInterest)?.value.open || [],
    (o) => o.pieces
  );

export const mergePointsAtSameTimestamp = (
  history: History<number>
): History<number> => {
  return Object.entries(group(history, (point) => point.timestamp)).map(
    ([timestamp, values]) => ({
      timestamp: parseInt(timestamp),
      value: sum(values || [], (values) => values.value),
    })
  );
};

export const anchorHistoryToRangeStart = (
  history: History<number>,
  anchorPoint: HistoryPoint<number> | undefined,
  rangeStart: number
): History<number> =>
  anchorPoint
    ? reanchorHistory(history, anchorPoint, rangeStart)
    : history.filter((p) => p.timestamp >= rangeStart);

export const anchorHistoryToBenchmarkStart = (
  history: History<number>,
  benchmarkHistory: History<number>
): History<number> => {
  const benchmarkStart = benchmarkHistory[0]?.timestamp;
  const anchorPoint =
    benchmarkStart !== undefined
      ? pickValueFromHistory(history, benchmarkStart)
      : undefined;

  return anchorPoint
    ? reanchorHistory(history, anchorPoint, anchorPoint.timestamp)
    : history;
};

const reanchorHistory = (
  history: History<number>,
  anchorPoint: HistoryPoint<number>,
  filterStart: number
): History<number> =>
  select(
    history,
    getHistoryPointMapper((p) =>
      rel2percentage(percentage2rel(p) / percentage2rel(anchorPoint.value))
    ),
    (p) => p.timestamp >= filterStart
  );

export const getBenchmarkHistory = (
  priceHistory: History<number>,
  portfolioStartTime: number
): History<number> => {
  const startPoint = priceHistory.find(
    (p) => p.timestamp >= portfolioStartTime
  );

  if (!startPoint) {
    return [];
  }

  const { timestamp, value } = startPoint;

  return select(
    priceHistory,
    getHistoryPointMapper((p) => rel2percentage(p / value)),
    (p) => p.timestamp >= timestamp
  );
};

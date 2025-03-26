import { group, sum, unique } from "radash";
import { Batches } from "../batch/batch.entities";
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

export const pickValueFromHistory = <T>(
  history: History<T>,
  t: number,
  historyOrder: "ascending" | "descending" = "ascending"
) =>
  historyOrder === "ascending"
    ? history.findLast((point) => point.timestamp <= t)
    : history.find((point) => point.timestamp <= t);

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

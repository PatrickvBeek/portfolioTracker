import { sum, unique } from "radash";
import { Batches } from "../batch/batch.entities";
import { History } from "./history.entities";

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

export const getHistoryMapper =
  <T, U>(mapper: (el: T) => U) =>
  (history: History<T>): History<U> =>
    history.map((point) => ({
      timestamp: point.timestamp,
      value: mapper(point.value),
    }));

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

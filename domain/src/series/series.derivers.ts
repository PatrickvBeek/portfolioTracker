import { sort, sum } from "radash";
import {
  getBatchInitialValue,
  getBatchesHistory,
} from "../batch/batch.derivers";
import {
  BatchesHistory,
  BatchesHistoryDataPoint,
} from "../batch/batch.entities";
import { Portfolio } from "../portfolio/portfolio.entities";
import { updateBy } from "../utils/arrays";
import { Series, SeriesPoint } from "./series.entities";

export function getInitialValueSeriesForPortfolio(
  portfolio: Portfolio
): Series<number> {
  const diffs = Object.values(portfolio.orders)
    .map(getBatchesHistory)
    .map(batchHistoryToSeries)
    .map(differentiateNumberSeries)
    .flat();

  return updateBy(
    sort(diffs, (diff) => diff.timestamp),
    (prev, current) => ({
      timestamp: current.timestamp,
      value: prev.value + current.value,
    })
  );
}

const differentiateNumberSeries = (series: Series<number>): Series<number> => {
  if (series.length < 2) {
    return series;
  }
  const [first, ...rest] = series;
  const diff = [first];
  let prevPoint = first;

  rest.forEach((point) => {
    const newPoint: SeriesPoint<number> = {
      timestamp: point.timestamp,
      value: point.value - prevPoint.value,
    };
    prevPoint = point;
    diff.push(newPoint);
  });

  return diff;
};

const batchHistoryToSeries = (history: BatchesHistory): Series<number> =>
  history.map(batchHistoryDataPointToSeriesPoint);

const batchHistoryDataPointToSeriesPoint = (
  point: BatchesHistoryDataPoint
): SeriesPoint<number> => ({
  timestamp: point.date.getTime(),
  value: sum(point.batches.open, getBatchInitialValue),
});

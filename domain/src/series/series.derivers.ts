import { sort, sum, unique } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { getBatchesHistory, getBuyValue } from "../batch/batch.derivers";
import {
  BatchesHistory,
  BatchesHistoryDataPoint,
} from "../batch/batch.entities";
import { getOrderVolume } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { Portfolio } from "../portfolio/portfolio.entities";
import { updateBy } from "../utils/arrays";
import { Series, SeriesPoint } from "./series.entities";

export const geBuyValueSeriesForPortfolio = (
  portfolio: Portfolio
): Series<number> => {
  const diffs = Object.values(portfolio.orders)
    .map(getBatchesHistory)
    .map(batchHistoryToBuyValueSeries)
    .map(differentiateNumberSeries)
    .flat();

  return updateBy(
    sort(diffs, (diff) => diff.timestamp),
    (prev, current) => ({
      timestamp: current.timestamp,
      value: prev.value + current.value,
    })
  );
};

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

const batchHistoryToBuyValueSeries = (
  history: BatchesHistory
): Series<number> => history.map(batchHistoryDataPointToBuyValueSeriesPoint);

const batchHistoryDataPointToBuyValueSeriesPoint = (
  point: BatchesHistoryDataPoint
): SeriesPoint<number> => ({
  timestamp: point.date.getTime(),
  value: sum(point.batches.open, getBuyValue),
});

export const removeDuplicatesAtSameTimeStamp = <T>(series: Series<T>) =>
  unique(series.toReversed(), (dataPoint) => dataPoint.timestamp).toReversed();

export const getCashFlowSeriesForOrders = (orders: Order[]): Series<number> =>
  orders.reduce<Series<number>>(
    (series, order) => [
      ...series,
      {
        timestamp: getNumericDateTime(order),
        value: (series.at(-1)?.value || 0) + getOrderVolume(order),
      },
    ],
    []
  );

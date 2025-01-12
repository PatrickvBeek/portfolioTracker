import { sort, sum, unique } from "radash";
import { getNumericDateTime } from "../activity/activity.derivers";
import { getBatchesHistory, getBuyValue } from "../batch/batch.derivers";
import { BatchesHistory } from "../batch/batch.entities";
import { getOrderVolume } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { Portfolio } from "../portfolio/portfolio.entities";
import { updateBy } from "../utils/arrays";
import { History, HistoryPoint } from "./history.entities";

export const geBuyValueHistoryForPortfolio = (
  portfolio: Portfolio
): History<number> => {
  const diffs = Object.values(portfolio.orders)
    .map(getBatchesHistory)
    .map(batchHistoryToBuyValueHistory)
    .map(differentiateNumberHistory)
    .flat();

  return updateBy(
    sort(diffs, (diff) => diff.timestamp),
    (prev, current) => ({
      timestamp: current.timestamp,
      value: prev.value + current.value,
    })
  );
};

const differentiateNumberHistory = (
  history: History<number>
): History<number> => {
  if (history.length < 2) {
    return history;
  }
  const [first, ...rest] = history;
  const diff = [first];
  let prevPoint = first;

  rest.forEach((point) => {
    const newPoint: HistoryPoint<number> = {
      timestamp: point.timestamp,
      value: point.value - prevPoint.value,
    };
    prevPoint = point;
    diff.push(newPoint);
  });

  return diff;
};

const batchHistoryToBuyValueHistory = (
  history: BatchesHistory
): History<number> =>
  history.map((point) => ({
    timestamp: point.date.getTime(),
    value: sum(point.batches.open, getBuyValue),
  }));

export const removeDuplicatesAtSameTimeStamp = <T>(series: History<T>) =>
  unique(series.toReversed(), (dataPoint) => dataPoint.timestamp).toReversed();

export const getCashFlowHistoryForOrders = (orders: Order[]): History<number> =>
  orders.reduce<History<number>>(
    (series, order) => [
      ...series,
      {
        timestamp: getNumericDateTime(order),
        value: (series.at(-1)?.value || 0) + getOrderVolume(order),
      },
    ],
    []
  );

import { sort, sum } from "radash";
import { updateBy } from "../../utility/arrays";
import { Portfolio } from "../portfolio/portfolio.entities";
import {
  getPositionHistory,
  getPositionInitialValue,
} from "../position/position.derivers";
import {
  PositionHistory,
  PositionHistoryDataPoint,
} from "../position/position.entities";
import { Series, SeriesPoint } from "./series.entities";

export function getInitialValueSeriesForPortfolio(
  portfolio: Portfolio
): Series<number> {
  const diffs = Object.values(portfolio.orders)
    .map(getPositionHistory)
    .map(historyToSeries)
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

const historyToSeries = (history: PositionHistory): Series<number> =>
  history.map(positionHistoryDataPointToSeriesPoint);

const positionHistoryDataPointToSeriesPoint = (
  point: PositionHistoryDataPoint
): SeriesPoint<number> => ({
  timestamp: point.date.getTime(),
  value: sum(point.positions.open, getPositionInitialValue),
});

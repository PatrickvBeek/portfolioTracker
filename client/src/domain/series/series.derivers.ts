import { sum } from "radash";
import { getAllOrdersInPortfolioTimeSorted } from "../portfolio/portfolio.derivers";
import { Portfolio } from "../portfolio/portfolio.entities";
import {
  getPositionHistory,
  getPositionInitialValue,
} from "../position/position.derivers";
import { PositionHistoryDataPoint } from "../position/position.entities";
import { Series, SeriesPoint } from "./series.entities";

export function getInitialValueSeriesForPortfolio(
  portfolio: Portfolio
): Series<number> {
  return getPositionHistory(getAllOrdersInPortfolioTimeSorted(portfolio)).map(
    positionHistoryDataPointToSeriesPoint
  );
}

const positionHistoryDataPointToSeriesPoint = (
  point: PositionHistoryDataPoint
): SeriesPoint<number> => ({
  timestamp: point.date.getTime(),
  value: sum(point.positions.open, getPositionInitialValue),
});

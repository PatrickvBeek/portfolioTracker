import { sort, zip } from "radash";
import { accumulate } from "../../utility/arrays";
import {
  getNumericDateTime,
  getOrderDate,
  getOrderVolume,
} from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { getAllOrdersInPortfolioTimeSorted } from "../portfolio/portfolio.derivers";
import { Portfolio } from "../portfolio/portfolio.entities";
import { Series } from "./series.entities";

export function getInvestedValueSeriesForPortfolio(
  portfolio: Portfolio
): Series<"invested_value"> {
  return getInvestedValueSeriesFromOrders(
    getAllOrdersInPortfolioTimeSorted(portfolio)
  );
}

function getInvestedValueSeriesFromOrders(
  allOrders: Order[]
): Series<"invested_value"> {
  const allOrdersSorted = sort(allOrders, getNumericDateTime);
  const dates = allOrdersSorted.map(getOrderDate);
  const accumulatedVolumes = accumulate(allOrdersSorted.map(getOrderVolume));

  return { data: zip(dates, accumulatedVolumes), seriesType: "invested_value" };
}

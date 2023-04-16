import { sort, zip } from "radash";
import { accumulate } from "../../utility/arrays";
import { getOrderVolume } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { Portfolio } from "../portfolio/portfolio.entities";
import { Series } from "./series.entities";

export function getInvestedValueSeriesForPortfolio(
  portfolio: Portfolio
): Series<"invested_value"> {
  const allOrders = Object.values(portfolio.orders).flat();
  return getInvestedValueSeriesFromOrders(allOrders);
}

function getInvestedValueSeriesFromOrders(
  allOrders: Order[]
): Series<"invested_value"> {
  const allOrdersSorted = sort(allOrders, (order) =>
    new Date(order.timestamp).getTime()
  );
  const dates = allOrdersSorted.map((o) => new Date(o.timestamp));
  const accumulatedVolumes = accumulate(allOrdersSorted.map(getOrderVolume));

  return { data: zip(dates, accumulatedVolumes), seriesType: "invested_value" };
}

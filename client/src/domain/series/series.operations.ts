import { sort, zip } from "radash";
import { accumulate } from "../../utility/arrays";
import { getOrderVolume } from "../order/order.operations";
import { Portfolio } from "../types";
import { Series } from "./series.entities";

export function getInvestedValueSeries(
  portfolio: Portfolio
): Series<"invested_value"> {
  const allOrdersSorted = sort(
    Object.values(portfolio.orders).flat(),
    (order) => new Date(order.timestamp).getTime()
  );
  const dates = allOrdersSorted.map((o) => new Date(o.timestamp));
  const accumulatedVolumes = accumulate(allOrdersSorted.map(getOrderVolume));

  return { data: zip(dates, accumulatedVolumes), seriesType: "invested_value" };
}

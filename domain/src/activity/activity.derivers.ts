import { getDividendNetVolume } from "../dividendPayouts/dividend.derivers";
import { getOrderCashFlow } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import { PortfolioActivity } from "./activity.entities";

export const getActivityDate: (activity: PortfolioActivity) => Date = (order) =>
  new Date(order.timestamp);

export const getNumericDateTime: (activity: PortfolioActivity) => number = (
  activity
) => getActivityDate(activity).getTime();

export const isOrder = (activity: PortfolioActivity): activity is Order =>
  "orderFee" in activity;

export const getActivityCashFlow = (a: PortfolioActivity): number =>
  isOrder(a) ? getOrderCashFlow(a) : -1 * getDividendNetVolume(a);

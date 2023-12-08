import { Order } from "../order/order.entities";
import { PortfolioActivity } from "./activity.entities";

export const getActivityDate: (activity: PortfolioActivity) => Date = (order) =>
  new Date(order.timestamp);

export const getNumericDateTime: (activity: PortfolioActivity) => number = (
  activity
) => getActivityDate(activity).getTime();

export const isOrder = (activity: PortfolioActivity): activity is Order =>
  "orderFee" in activity;

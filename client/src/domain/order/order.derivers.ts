import { Order } from "./order.entities";

export const getOrderVolume: (order: Order) => number = (order) =>
  order.pieces * order.sharePrice;

export const getOrderDate: (order: Order) => Date = (order) =>
  new Date(order.timestamp);

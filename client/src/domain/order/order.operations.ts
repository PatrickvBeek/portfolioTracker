import { Order } from "../types";

export const getOrderVolume: (order: Order) => number = (order) =>
  order.pieces * order.sharePrice;

import { isEqual, omit } from "radash";
import { areDatesOnSameDay } from "../../utility/dateUtils";
import { Order } from "./order.entities";

export const getOrderVolume: (order: Order) => number = ({
  pieces,
  sharePrice,
}) => pieces * sharePrice;

export const areOrdersEqualOnDay: (order1: Order, order2: Order) => boolean = (
  o1,
  o2
) =>
  isEqual(omit(o1, ["timestamp", "uuid"]), omit(o2, ["timestamp", "uuid"])) &&
  areDatesOnSameDay(o1.timestamp, o2.timestamp);

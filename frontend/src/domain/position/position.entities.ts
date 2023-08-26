import { Order } from "../order/order.entities";

export interface OpenPosition {
  pieces: Order["pieces"];
  buyDate: Order["timestamp"];
  buyPrice: Order["sharePrice"];
  orderFee: Order["orderFee"];
}

export interface ClosedPosition extends OpenPosition {
  sellDate: Order["timestamp"];
  sellPrice: Order["sharePrice"];
}

export interface Positions {
  open: OpenPosition[];
  closed: ClosedPosition[];
}

export interface PositionHistoryDataPoint {
  date: Date;
  positions: Positions;
}

export type PositionHistory = PositionHistoryDataPoint[];

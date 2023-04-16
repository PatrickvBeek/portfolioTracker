import { Order } from "../order/order.entities";

export interface AssetPositions {
  open: OpenPosition[];
  closed: ClosedPosition[];
}

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

import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";

export interface OpenBatch {
  pieces: Order["pieces"];
  buyDate: Order["timestamp"];
  buyPrice: Order["sharePrice"];
  orderFee: Order["orderFee"];
  taxes: Order["taxes"];
  dividendPayouts: DividendPayout[];
}

export interface ClosedBatch extends OpenBatch {
  sellDate: Order["timestamp"];
  sellPrice: Order["sharePrice"];
}

export interface Batches {
  open: OpenBatch[];
  closed: ClosedBatch[];
}

export interface BatchesHistoryDataPoint {
  date: Date;
  batches: Batches;
}

export type BatchesHistory = BatchesHistoryDataPoint[];

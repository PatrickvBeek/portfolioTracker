import { ValueOf } from "type-fest";

export interface Asset {
  isin: string;
  displayName: string;
  wkn?: string;
}

export interface AssetLibrary {
  [isin: string]: Asset;
}

export interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
  transactions: CashTransaction[];
}

export interface PortfolioLibrary {
  [identifier: string]: Portfolio;
}

const CASH_TRANSACTION_KIND = {
  WITHDRAW: "WITHDRAW",
  DEPOSIT: "DEPOSIT",
};

export interface Order {
  uuid: string;
  asset: string;
  pieces: number;
  sharePrice: number;
  timestamp: string;
  orderFee: number;
}

export type CashTransactionKind = ValueOf<typeof CASH_TRANSACTION_KIND>;

export interface CashTransaction {
  uuid: string;
  date: string;
  amount: number;
  type: CashTransactionKind;
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

export interface AssetPositions {
  open: OpenPosition[];
  closed: ClosedPosition[];
}

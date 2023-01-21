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
  amount: number;
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

export interface Position {
  pieces: number;
  bought: number;
  sold?: number;
}

export interface AssetPositions {
  open: Position[];
  closed: Position[];
}

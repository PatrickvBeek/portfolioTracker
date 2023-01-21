export interface Asset {
  isin: string;
  displayName: string;
  wkn?: string;
}

export interface Order {
  uuid: string;
  asset: Asset;
  pieces: number;
  amount: number;
  timestamp: string;
  orderFee: number;
}

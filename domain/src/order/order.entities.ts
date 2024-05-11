export interface Order {
  uuid: string;
  asset: string;
  pieces: number;
  sharePrice: number;
  timestamp: string;
  orderFee: number;
  taxes: number;
}

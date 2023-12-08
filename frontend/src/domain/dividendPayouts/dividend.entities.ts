export type DividendPayout = {
  uuid: string;
  asset: string;
  pieces: number;
  dividendPerShare: number;
  timestamp: string;
  taxes: number;
};

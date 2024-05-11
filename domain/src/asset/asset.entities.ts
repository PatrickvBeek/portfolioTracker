export interface Asset {
  isin: string;
  displayName: string;
  symbol?: string;
}

export interface AssetLibrary {
  [isin: string]: Asset;
}

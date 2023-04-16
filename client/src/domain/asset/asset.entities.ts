export interface Asset {
  isin: string;
  displayName: string;
  wkn?: string;
}

export interface AssetLibrary {
  [isin: string]: Asset;
}

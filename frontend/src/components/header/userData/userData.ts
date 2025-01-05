import { AssetLibrary } from "pt-domain/src/asset/asset.entities";
import { PortfolioLibrary } from "pt-domain/src/portfolio/portfolio.entities";

export const EXPORT_VERSION = 1;

export type ExportedData = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  meta: {
    exportVersion: number;
  };
};

export const parseUserData = (jsonString: string): ExportedData => {
  const parsedObject = JSON.parse(jsonString) as ExportedData;
  if (!(parsedObject.assets && parsedObject.meta && parsedObject.portfolios)) {
    throw new Error(`cannot parse user data ${jsonString}`);
  }

  return parsedObject;
};

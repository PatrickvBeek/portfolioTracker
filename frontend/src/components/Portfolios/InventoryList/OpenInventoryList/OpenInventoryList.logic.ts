import { AssetLibrary } from "../../../../../../domain/src/asset/asset.entities";
import {
  getDividendSum,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../../../../domain/src/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../../../domain/src/portfolio/portfolio.entities";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";

export function useGetOpenInventoryRows(portfolio: string) {
  const portfolioQuery = useGetPortfolio(portfolio);
  const assetQuery = useGetAssets();
  return getInventoryRows(portfolioQuery.data, assetQuery.data);
}

export type OpenInventoryItem = {
  asset: string;
  pieces: number;
  initialValue: number;
  orderFees: number;
  dividends: number;
};

function getInventoryRows(
  portfolio?: Portfolio,
  assets?: AssetLibrary
): OpenInventoryItem[] | undefined {
  if (!(assets && portfolio)) {
    return undefined;
  }
  return Object.keys(portfolio.orders)
    .map((isin) => ({
      asset: assets[isin]?.displayName || "asset not found",
      pieces: Number(
        getPiecesOfIsinInPortfolio(portfolio, isin, "open").toPrecision(4)
      ),
      initialValue: getInitialValueOfIsinInPortfolio(portfolio, isin, "open"),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "open"),
      dividends: getDividendSum(portfolio, isin, "open"),
    }))
    .filter((pos) => pos.pieces > 0);
}

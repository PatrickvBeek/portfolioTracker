import { AssetLibrary } from "../../../../../../domain/src/asset/asset.entities";
import {
  getDividendSum,
  getEndValueOfIsinInPortfolio,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
  getProfitForIsin,
  getTotalTaxesForClosedAssetBatches,
} from "../../../../../../domain/src/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../../../domain/src/portfolio/portfolio.entities";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";

export function useGetClosedInventoryRows(portfolio: string) {
  const portfolioQuery = useGetPortfolio(portfolio);
  const assetQuery = useGetAssets();

  return getInventoryRows(portfolioQuery.data, assetQuery.data);
}

export type ClosedInventoryItem = {
  asset: string;
  pieces: number;
  initialValue: number;
  endValue: number;
  orderFees: number;
  dividends: number;
  profit: number;
  taxes: number;
};

function getInventoryRows(
  portfolio?: Portfolio,
  assets?: AssetLibrary,
): ClosedInventoryItem[] | undefined {
  if (!(assets && portfolio)) {
    return undefined;
  }
  return Object.keys(portfolio.orders)
    .map((isin) => ({
      asset: assets[isin]?.displayName || "asset not found",
      pieces: Number(
        getPiecesOfIsinInPortfolio(portfolio, isin, "closed").toPrecision(4),
      ),
      initialValue: getInitialValueOfIsinInPortfolio(portfolio, isin, "closed"),
      endValue: getEndValueOfIsinInPortfolio(portfolio, isin),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "closed"),
      dividends: getDividendSum(portfolio, isin, "closed"),
      taxes: getTotalTaxesForClosedAssetBatches(portfolio, isin),
      profit: getProfitForIsin(portfolio, isin),
    }))
    .filter((pos) => pos.pieces > 0);
}

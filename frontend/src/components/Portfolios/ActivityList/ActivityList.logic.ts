import { Coins, TrendingDown, TrendingUp } from "lucide-react";
import {
  getDividendVolume,
  getOrderVolume,
  isOrder,
  PortfolioActivity,
} from "pt-domain";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import {
  useGetPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { toPrice } from "../../../utility/prices";

export type ActivityType = "buy" | "sell" | "dividend";

const typeConfig: Record<
  ActivityType,
  { label: string; icon: typeof TrendingUp }
> = {
  buy: { label: "Buy", icon: TrendingUp },
  sell: { label: "Sell", icon: TrendingDown },
  dividend: { label: "Dividend", icon: Coins },
};

function getActivityType(activity: PortfolioActivity): ActivityType {
  if (!isOrder(activity)) {
    return "dividend";
  }
  return activity.pieces > 0 ? "buy" : "sell";
}

export type ActivityRowData = {
  activity: PortfolioActivity;
  activityType: ActivityType;
  label: string;
  icon: typeof TrendingUp;
  assetName: string;
  amount: string;
  pricePerShare: string;
  fees: string;
  taxes: string;
};

export function toActivityRowData(
  activity: PortfolioActivity,
  assets: Record<string, { displayName?: string }>
): ActivityRowData {
  const activityType = getActivityType(activity);
  const { label, icon } = typeConfig[activityType];
  const assetName = assets[activity.asset]?.displayName || "asset not found";
  const amount = isOrder(activity)
    ? toPrice(getOrderVolume(activity))
    : toPrice(getDividendVolume(activity));
  const pricePerShare = isOrder(activity)
    ? toPrice(activity.sharePrice)
    : toPrice(activity.dividendPerShare);
  const fees = isOrder(activity) ? toPrice(activity.orderFee) : toPrice(0);
  const taxes = toPrice(activity.taxes);

  return {
    activity,
    activityType,
    label,
    icon,
    assetName,
    amount,
    pricePerShare,
    fees,
    taxes,
  };
}

export function useActivityListData(portfolioName: string) {
  const activity = useGetPortfolioActivity(portfolioName);
  const portfolioData = useGetPortfolio(portfolioName);
  const assetsLib = useGetAssets();
  return { activity, portfolioData, assetsLib };
}

import { isOrder } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import { getBatches } from "../batch/batch.derivers";
import { Portfolio } from "./portfolio.entities";

export function canDeleteActivity(
  portfolio: Portfolio,
  activityToDelete: PortfolioActivity
): boolean {
  if (!isOrder(activityToDelete)) {
    return true;
  }

  const asset = activityToDelete.asset;

  const ordersForAsset = portfolio.orders[asset] || [];
  const remainingOrders = ordersForAsset.filter(
    (order) => order.uuid !== activityToDelete.uuid
  );

  const dividendsForAsset = portfolio.dividendPayouts[asset] || [];

  return getBatches(remainingOrders, dividendsForAsset) !== undefined;
}

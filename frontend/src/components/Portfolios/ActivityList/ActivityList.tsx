import moment from "moment";
import { ReactElement } from "react";
import { isOrder } from "../../../../../domain/src/activity/activity.derivers";
import { getDividendVolume } from "../../../../../domain/src/dividendPayouts/dividend.derivers";
import { DividendPayout } from "../../../../../domain/src/dividendPayouts/dividend.entities";
import { getOrderVolume } from "../../../../../domain/src/order/order.derivers";
import { Order } from "../../../../../domain/src/order/order.entities";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import {
  useDeleteDividendPayoutFromPortfolio,
  useDeleteOrderFromPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import CustomTable, { ColDef } from "../../general/CustomTable/CustomTable";
import DeleteButtonWithConfirmation from "../../general/DeleteButtonWithConfirm/DeleteButtonWithConfirmation";
import "./ActivityList.css";

const { bemBlock, bemElement } = bemHelper("order-list");

type ActivityListProps = Props<{
  portfolio: string;
}>;

function ActivityList({
  className,
  portfolio,
}: ActivityListProps): ReactElement | null {
  const activityQuery = useGetPortfolioActivity(portfolio);
  const assetsQuery = useGetAssets();
  const deleteOrder = useDeleteOrderFromPortfolio(portfolio).mutate;
  const deleteDividendPayout =
    useDeleteDividendPayoutFromPortfolio(portfolio).mutate;

  if (!activityQuery.isSuccess || !assetsQuery.isSuccess) {
    return null;
  }

  const tableData = activityQuery.data.reverse();
  const assets = assetsQuery.data;

  const defs: ColDef<Order | DividendPayout>[] = [
    {
      header: "Type",
      valueGetter: (a) =>
        isOrder(a) ? (
          <i className={`fa fa-${a.pieces > 0 ? "plus" : "minus"}`} />
        ) : (
          <i className={"fa fa-euro-sign"} />
        ),
      alignment: "center",
    },
    {
      header: "Date",
      valueGetter: (a) => moment(a.timestamp).format("ll"),
    },
    {
      header: "Asset",
      valueGetter: (a) => assets[a.asset]?.displayName || "asset not found",
    },
    { header: "Pieces", valueGetter: (a) => a.pieces, alignment: "right" },
    {
      header: "Value per Share",
      valueGetter: (a) =>
        isOrder(a) ? toPrice(a.sharePrice) : toPrice(a.dividendPerShare),
      alignment: "right",
    },
    {
      header: "Amount",
      valueGetter: (a) =>
        isOrder(a) ? toPrice(getOrderVolume(a)) : toPrice(getDividendVolume(a)),
      alignment: "right",
    },
    {
      header: "Fees",
      valueGetter: (a) => (isOrder(a) ? toPrice(a.orderFee) : toPrice(0)),
      alignment: "right",
    },
    {
      header: "Taxes",
      valueGetter: (a) => toPrice(a.taxes),
      alignment: "right",
    },
    {
      header: "Actions",
      valueGetter: (a) => (
        <DeleteButtonWithConfirmation
          deleteHandler={() =>
            isOrder(a) ? deleteOrder(a) : deleteDividendPayout(a)
          }
          title={"Delete Activity?"}
          body={`Are you sure you want to delete this activity?`}
        />
      ),
      alignment: "center",
    },
  ];

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("headline")}>Portfolio Activity</div>
      <CustomTable columDefs={defs} rows={tableData} />
    </div>
  );
}

export default ActivityList;

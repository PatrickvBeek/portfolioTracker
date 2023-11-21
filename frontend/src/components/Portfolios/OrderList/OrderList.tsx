import moment from "moment";
import { ReactElement } from "react";
import { DividendPayout } from "../../../domain/dividendPayouts/dividend.entities";
import { Order } from "../../../domain/order/order.entities";
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
import "./OrderList.css";

const { bemBlock, bemElement } = bemHelper("order-list");

type OrderListProps = Props<{
  portfolio: string;
}>;

function OrderList({
  className,
  portfolio,
}: OrderListProps): ReactElement | null {
  const activityQuery = useGetPortfolioActivity(portfolio);
  const assetsQuery = useGetAssets();
  const deleteOrder = useDeleteOrderFromPortfolio(portfolio).mutate;
  const deleteDividendPayout =
    useDeleteDividendPayoutFromPortfolio(portfolio).mutate;

  if (!activityQuery.isSuccess || !assetsQuery.isSuccess) {
    return null;
  }

  const tableData = activityQuery.data;
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
        isOrder(a)
          ? toPrice(a.sharePrice * a.pieces)
          : toPrice(a.dividendPerShare * a.pieces),
      alignment: "right",
    },
    {
      header: "Fees",
      valueGetter: (a) => (isOrder(a) ? toPrice(a.orderFee) : toPrice(0)),
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

function isOrder(
  activityEntry: Order | DividendPayout
): activityEntry is Order {
  return (activityEntry as Order).sharePrice !== undefined;
}

export default OrderList;

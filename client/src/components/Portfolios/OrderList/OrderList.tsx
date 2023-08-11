import moment from "moment";
import { ReactElement } from "react";
import { Order } from "../../../domain/order/order.entities";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import {
  useDeleteOrderFromPortfolio,
  useGetOrders,
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
  const ordersQuery = useGetOrders(portfolio);
  const assetsQuery = useGetAssets();
  const deleteOrderMutation = useDeleteOrderFromPortfolio(portfolio);

  if (!ordersQuery.isSuccess || !assetsQuery.isSuccess) {
    return null;
  }

  const tableData = Object.values(ordersQuery.data).flat();
  const assets = assetsQuery.data;

  const defs: ColDef<Order>[] = [
    {
      header: "Date",
      valueGetter: (o) => moment(o.timestamp).format("ll"),
    },
    {
      header: "Asset",
      valueGetter: (o) => assets[o.asset]?.displayName || "asset not found",
    },
    { header: "Pieces", valueGetter: (o) => o.pieces, alignment: "right" },
    {
      header: "Price",
      valueGetter: (o) => toPrice(o.sharePrice),
      alignment: "right",
    },
    {
      header: "Amount",
      valueGetter: (o) => toPrice(o.sharePrice * o.pieces),
      alignment: "right",
    },
    {
      header: "Fees",
      valueGetter: (o) => toPrice(o.orderFee),
      alignment: "right",
    },
    {
      header: "Actions",
      valueGetter: (o) => (
        <DeleteButtonWithConfirmation
          deleteHandler={() => deleteOrderMutation.mutate(o)}
          title={"Delete Order?"}
          body={`Are you sure you want to delete this order?`}
        />
      ),
    },
  ];

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("headline")}>Orders</div>
      <CustomTable columDefs={defs} rows={tableData} />
    </div>
  );
}

export default OrderList;

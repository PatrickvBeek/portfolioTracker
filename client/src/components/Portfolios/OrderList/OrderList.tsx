import moment from "moment";
import { ReactElement } from "react";
import { Order } from "../../../domain/order/order.entities";
import { useGetOrders } from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import CustomTable, { ColDef } from "../../general/CustomTable/CustomTable";
import "./OrderList.css";

const { bemBlock, bemElement } = bemHelper("order-list");

const defs: ColDef<Order>[] = [
  {
    header: "Date",
    valueGetter: (o) => moment(o.timestamp).format("ll"),
  },
  { header: "Asset", valueGetter: (o) => o.asset },
  { header: "Pieces", valueGetter: (o) => o.pieces },
  { header: "Price", valueGetter: (o) => toPrice(o.sharePrice) },
  { header: "Amount", valueGetter: (o) => toPrice(o.sharePrice * o.pieces) },
  { header: "Fees", valueGetter: (o) => o.orderFee },
];

type OrderListProps = Props<{
  portfolio: string;
}>;

function OrderList({
  className,
  portfolio,
}: OrderListProps): ReactElement | null {
  const ordersQuery = useGetOrders(portfolio);

  if (!ordersQuery.isSuccess) {
    return null;
  }

  const tableData = Object.values(ordersQuery.data).flat();

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("headline")}>Orders</div>
      <CustomTable columDefs={defs} rows={tableData} />
    </div>
  );
}

export default OrderList;

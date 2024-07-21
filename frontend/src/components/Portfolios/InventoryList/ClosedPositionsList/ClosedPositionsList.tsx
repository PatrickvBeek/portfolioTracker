import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { sum } from "radash";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import Balance from "../../../general/Balance/Balance";
import CustomTable from "../../../general/CustomTable/CustomTable";
import "../PositionList.css";
import {
  ClosedPositionItem,
  useGetClosedPositionRows,
} from "./ClosedPositionsList.logic";

type OpenPositionsListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("position-list");

const columnHelper = createColumnHelper<ClosedPositionItem>();

const columDefs: ColumnDef<ClosedPositionItem, any>[] = [
  columnHelper.accessor("asset", {
    header: "Asset",
    footer: (props) =>
      `${props.table.getRowCount()} Position${props.table.getRowCount() === 1 ? "" : "s"}`,
    meta: {
      align: "left",
    },
  }),
  columnHelper.accessor("pieces", {
    header: "Pieces",
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("initialValue", {
    header: "Initial Value",
    id: "initialValue",
    cell: (i) => toPrice(i.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) =>
          row.getValue("initialValue")
        )
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("endValue", {
    header: "End Value",
    id: "endValue",
    cell: (e) => toPrice(e.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("endValue"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("dividends", {
    header: "Dividends",
    id: "dividends",
    cell: (d) => toPrice(d.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("dividends"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("orderFees", {
    header: "Fees",
    id: "orderFees",
    cell: (i) => toPrice(i.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("orderFees"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("taxes", {
    header: "Total Taxes",
    id: "taxes",
    cell: (i) => toPrice(i.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("taxes"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("profit", {
    id: "profit",
    header: "Profit",
    cell: (p) => toPrice(p.getValue()),
    footer: (props) => (
      <Balance
        value={sum(props.table.getRowModel().rows, (row) =>
          row.getValue("profit")
        )}
      />
    ),
    meta: {
      align: "right",
    },
  }),
];

export const ClosedPositionsList = ({
  className,
  portfolioName,
}: OpenPositionsListProps) => {
  const closedPositions = useGetClosedPositionRows(portfolioName);

  return closedPositions ? (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Closed Positions</div>
      <CustomTable data={closedPositions} columns={columDefs} />
    </div>
  ) : null;
};

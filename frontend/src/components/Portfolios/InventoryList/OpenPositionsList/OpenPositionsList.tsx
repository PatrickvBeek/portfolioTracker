import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { sum } from "radash";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import CustomTable from "../../../general/CustomTable/CustomTable";
import "../PositionList.css";
import {
  OpenPositionsItem,
  useGetOpenPositionRows,
} from "./OpenPositionsList.logic";

type OpenPositionsListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("position-list");

const columnHelper = createColumnHelper<OpenPositionsItem>();

const columDefs: ColumnDef<OpenPositionsItem, any>[] = [
  columnHelper.accessor("asset", {
    header: "Asset",
    footer: (props) =>
      `${props.table.getRowCount()} Position${props.table.getRowCount() === 1 ? "" : "s"}`,
  }),
  columnHelper.accessor("pieces", {
    header: "Pieces",
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("initialValue", {
    id: "initialValue",
    header: "Initial Value",
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
  columnHelper.accessor("orderFees", {
    id: "fees",
    header: "Fees",
    cell: (fees) => toPrice(fees.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("fees"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("dividends", {
    id: "dividends",
    header: "Dividends",
    cell: (dividends) => toPrice(dividends.getValue()),
    footer: (props) =>
      toPrice(
        sum(props.table.getRowModel().rows, (row) => row.getValue("dividends"))
      ),
    meta: {
      align: "right",
    },
  }),
];

export const OpenPositionsList = ({
  className,
  portfolioName,
}: OpenPositionsListProps) => {
  const positions = useGetOpenPositionRows(portfolioName);

  return positions ? (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Open Positions</div>
      <CustomTable data={positions} columns={columDefs} />
    </div>
  ) : null;
};

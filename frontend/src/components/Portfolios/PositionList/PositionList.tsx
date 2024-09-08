import { IconButton } from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { sum } from "radash";
import { Batches } from "../../../../../domain/src/batch/batch.entities";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import Balance from "../../general/Balance/Balance";
import CustomTable from "../../general/CustomTable/CustomTable";
import { PositionBatches } from "./PositionBatches";
import "./PositionList.less";

const { bemBlock, bemElement } = bemHelper("position-list");

export type PositionsListItem = {
  asset: string;
  pieces: number;
  totalValue: number;
  realizedGains: number;
  nonRealizedGains: number;
  profit: number;
  batches: Batches | undefined;
  isin: string;
};

type PositionsListProps = Props<{
  headline: string;
  items: PositionsListItem[];
  portfolioName: string;
}>;

const columnHelper = createColumnHelper<PositionsListItem>();

const columDefs: ColumnDef<PositionsListItem, any>[] = [
  columnHelper.accessor("asset", {
    header: "Asset",
    cell: ({ row, getValue }) => (
      <div className={bemElement("asset-cell")}>
        {row.getCanExpand() && (
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? (
              <i className="fa fa-chevron-up" />
            ) : (
              <i className="fa fa-chevron-down" />
            )}
          </IconButton>
        )}
        {getValue()}
      </div>
    ),
    footer: ({ table }) =>
      `${table.getRowCount()} Position${table.getRowCount() === 1 ? "" : "s"}`,
  }),
  columnHelper.accessor("pieces", {
    header: "Pieces",
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("totalValue", {
    id: "totalValue",
    header: "Total Value",
    cell: (i) => toPrice(i.getValue()),
    footer: ({ table }) =>
      toPrice(
        sum(table.getRowModel().rows, (row) => row.getValue("totalValue"))
      ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("realizedGains", {
    id: "realizedGains",
    header: "Realized Gains",
    cell: (gains) => <Balance value={gains.getValue()} />,
    footer: ({ table }) => (
      <Balance
        value={sum(table.getRowModel().rows, (row) =>
          row.getValue("realizedGains")
        )}
      />
    ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("nonRealizedGains", {
    id: "nonRealizedGains",
    header: "Non-Realized Gains",
    cell: (gains) => <Balance value={gains.getValue()} />,
    footer: ({ table }) => (
      <Balance
        value={sum(table.getRowModel().rows, (row) =>
          row.getValue("nonRealizedGains")
        )}
      />
    ),
    meta: {
      align: "right",
    },
  }),
  columnHelper.accessor("profit", {
    id: "profit",
    header: "Profit",
    cell: (profit) => <Balance value={profit.getValue()} />,
    footer: ({ table }) => (
      <Balance
        value={sum(table.getRowModel().rows, (row) => row.getValue("profit"))}
      />
    ),
    meta: {
      align: "right",
    },
  }),
];

export const PositionsList = ({
  className,
  headline,
  items,
  portfolioName,
}: PositionsListProps) => {
  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>{headline}</div>
      <CustomTable
        key={portfolioName}
        data={items}
        columns={columDefs}
        getRowCanExpand={() => true}
        renderSubComponent={({ row }) => (
          <PositionBatches row={row} portfolioName={portfolioName} />
        )}
      />
    </div>
  );
};

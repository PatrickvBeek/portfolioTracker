import { IconButton } from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { sum } from "radash";
import { UseQueryResult } from "react-query";
import {
  Batches,
  BatchType,
} from "../../../../../domain/src/batch/batch.entities";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import Balance from "../../general/Balance/Balance";
import CustomTable from "../../general/CustomTable/CustomTable";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import {
  useGetNonRealizedPositionGains,
  useGetPositionPieces,
  useGetPositionProfit,
  useGetRealizedPositionGains,
  useGetTotalPositionValue,
} from "./ClosedPositionsList/PositionList.logic";
import { PositionBatches } from "./PositionBatches";
import "./PositionList.less";

const { bemBlock, bemElement } = bemHelper("position-list");

export type PositionsListItem = {
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
  batchType: BatchType;
  portfolioName: string;
}>;

const columnHelper = createColumnHelper<PositionsListItem>();

const getColumDefs: (
  portfolioName: string,
  batchType: BatchType
) => ColumnDef<PositionsListItem, any>[] = (portfolioName, batchType) => [
  {
    header: "Asset",
    cell: ({ row }) => (
      <AssetName
        isin={row.original.isin}
        canExpand={row.getCanExpand()}
        isExpanded={row.getIsExpanded()}
        toggleExpandHandler={row.getToggleExpandedHandler()}
      />
    ),
    footer: ({ table }) =>
      `${table.getRowCount()} Position${table.getRowCount() === 1 ? "" : "s"}`,
  },
  {
    header: "Pieces",
    cell: ({ row }) => (
      <PositionPieces
        portfolioName={portfolioName}
        isin={row.original.isin}
        batchType={batchType}
      />
    ),
    meta: {
      align: "right",
    },
  },
  columnHelper.accessor("totalValue", {
    id: "totalValue",
    header: "Total Value",
    cell: ({ row }) => (
      <TotalPositionValue
        portfolioName={portfolioName}
        isin={row.original.isin}
        batchType={batchType}
      />
    ),
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
    cell: ({ row }) => (
      <RealizedPositionGains
        isin={row.original.isin}
        portfolioName={portfolioName}
      />
    ),
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
    cell: ({ row }) => (
      <NonRealizedPositionGains
        isin={row.original.isin}
        portfolioName={portfolioName}
      />
    ),
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
    cell: ({ row }) => (
      <PositionProfit isin={row.original.isin} portfolioName={portfolioName} />
    ),
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

type PositionItemProps = {
  portfolioName: string;
  isin: string;
  batchType: BatchType;
};

function AssetName({
  isin,
  canExpand,
  isExpanded,
  toggleExpandHandler,
}: Pick<PositionItemProps, "isin"> & {
  canExpand: boolean;
  isExpanded: boolean;
  toggleExpandHandler: () => void;
}) {
  const assetsQuery = useGetAssets();
  if (assetsQuery.isLoading) {
    return <LoadingIndicator />;
  }

  if (!assetsQuery.isSuccess) {
    return <div>An error occurred...</div>;
  }

  const assetName = assetsQuery.data[isin]?.displayName;

  return (
    <div className={bemElement("asset-cell")}>
      {canExpand && (
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={toggleExpandHandler}
        >
          {isExpanded ? (
            <i className="fa fa-chevron-up" />
          ) : (
            <i className="fa fa-chevron-down" />
          )}
        </IconButton>
      )}
      {assetName || "Asset not found..."}
    </div>
  );
}

function PositionPieces({ portfolioName, isin, batchType }: PositionItemProps) {
  const query = useGetPositionPieces(portfolioName, isin, batchType);
  if (query.isLoading) {
    return <LoadingIndicator />;
  }

  if (!query.isSuccess) {
    return <div>An error occurred...</div>;
  }

  const pieces = Number(query.data.toPrecision(4));
  return <div>{pieces}</div>;
}

function TotalPositionValue({
  portfolioName,
  isin,
  batchType,
}: PositionItemProps) {
  const query = useGetTotalPositionValue(portfolioName, isin, batchType);

  if (query.isLoading) {
    return <LoadingIndicator />;
  }

  if (query.data === undefined) {
    return <div>Error...</div>;
  }

  const value = query.data;

  return <div>{toPrice(value)}</div>;
}

function RealizedPositionGains({
  portfolioName,
  isin,
}: Pick<PositionItemProps, "portfolioName" | "isin">) {
  const query = useGetRealizedPositionGains(portfolioName, isin);

  return <QueryAsBalance query={query} />;
}

function NonRealizedPositionGains({
  portfolioName,
  isin,
}: Pick<PositionItemProps, "portfolioName" | "isin">) {
  const query = useGetNonRealizedPositionGains(portfolioName, isin);

  return <QueryAsBalance query={query} />;
}

function PositionProfit({
  portfolioName,
  isin,
}: Pick<PositionItemProps, "portfolioName" | "isin">) {
  const query = useGetPositionProfit(portfolioName, isin);

  return <QueryAsBalance query={query} />;
}

function QueryAsBalance({ query }: { query: UseQueryResult<number> }) {
  if (query.isLoading) {
    return <LoadingIndicator />;
  }

  if (query.data === undefined) {
    return <div>Error...</div>;
  }

  const value = query.data;

  return <Balance value={value} />;
}

export const PositionsList = ({
  className,
  headline,
  portfolioName,
  batchType,
  items,
}: PositionsListProps) => {
  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>{headline}</div>
      <CustomTable
        key={portfolioName}
        data={items}
        columns={getColumDefs(portfolioName, batchType)}
        getRowCanExpand={() => true}
        renderSubComponent={({ row }) => (
          <PositionBatches row={row} portfolioName={portfolioName} />
        )}
      />
    </div>
  );
};

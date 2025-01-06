import { IconButton } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { BatchType } from "pt-domain/src/batch/batch.entities";
import { isNumber } from "radash";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { PriceQuery } from "../../../hooks/prices/priceHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import Balance from "../../general/Balance/Balance";
import CustomTable from "../../general/CustomTable/CustomTable";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import { PositionBatches } from "./PositionBatches";
import "./PositionList.less";
import {
  useGetNonRealizedPositionGains,
  useGetPositionPieces,
  useGetPositionProfit,
  useGetRealizedPositionGains,
  useGetTotalPositionValue,
  usePositionListSum,
} from "./PositionList.logic";

const { bemBlock, bemElement } = bemHelper("position-list");

type PositionsListProps = Props<{
  headline: string;
  items: string[];
  batchType: BatchType;
  portfolioName: string;
}>;

const getColumDefs: (
  portfolioName: string,
  batchType: BatchType
) => ColumnDef<string, any>[] = (portfolioName, batchType) => [
  {
    header: "Asset",
    cell: ({ row }) => (
      <AssetName
        isin={row.original}
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
        isin={row.original}
        batchType={batchType}
      />
    ),
    meta: {
      align: "right",
    },
  },
  {
    header: "Total Value",
    cell: ({ row }) => (
      <TotalPositionValue
        portfolioName={portfolioName}
        isin={row.original}
        batchType={batchType}
      />
    ),
    footer: () => (
      <TotalValueSum portfolioName={portfolioName} batchType={batchType} />
    ),
    meta: {
      align: "right",
    },
  },
  {
    header: "Realized Gains",
    cell: ({ row }) => (
      <RealizedPositionGains
        isin={row.original}
        portfolioName={portfolioName}
      />
    ),
    footer: () => (
      <PositionListSumAsBalance
        portfolioName={portfolioName}
        batchType={batchType}
        selector={useGetRealizedPositionGains}
      />
    ),
    meta: {
      align: "right",
    },
  },
  {
    header: "Non-Realized Gains",
    cell: ({ row }) => (
      <NonRealizedPositionGains
        isin={row.original}
        portfolioName={portfolioName}
      />
    ),
    footer: () => (
      <PositionListSumAsBalance
        portfolioName={portfolioName}
        batchType={batchType}
        selector={(p, isin) => useGetNonRealizedPositionGains(p, isin).data}
      />
    ),
    meta: {
      align: "right",
    },
  },
  {
    header: "Profit",
    cell: ({ row }) => (
      <PositionProfit isin={row.original} portfolioName={portfolioName} />
    ),
    footer: () => (
      <PositionListSumAsBalance
        portfolioName={portfolioName}
        batchType={batchType}
        selector={(p, isin) => useGetPositionProfit(p, isin).data}
      />
    ),
    meta: {
      align: "right",
    },
  },
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
  const assetLib = useGetAssets();

  if (!assetLib) {
    return null;
  }

  const assetName = assetLib[isin]?.displayName;

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
  const pieces = useGetPositionPieces(portfolioName, isin, batchType);
  const piecesRounded = Number(pieces.toPrecision(4));
  return <div>{piecesRounded}</div>;
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

function TotalValueSum({
  portfolioName,
  batchType,
}: Omit<PositionItemProps, "isin">) {
  const sum = usePositionListSum(
    portfolioName,
    batchType,
    (p, isin, batchType) => useGetTotalPositionValue(p, isin, batchType).data
  );
  return isNumber(sum) ? toPrice(sum) : null;
}

function RealizedPositionGains({
  portfolioName,
  isin,
}: Pick<PositionItemProps, "portfolioName" | "isin">) {
  const gains = useGetRealizedPositionGains(portfolioName, isin);

  return <Balance value={gains} />;
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

function PositionListSumAsBalance({
  portfolioName,
  batchType,
  selector,
}: {
  portfolioName: string;
  batchType: BatchType;
  selector: (
    portfolioName: string,
    isin: string,
    batchType: BatchType
  ) => number;
}) {
  const sum = usePositionListSum(portfolioName, batchType, selector);

  return isNumber(sum) ? <Balance value={sum} /> : null;
}

function QueryAsBalance({ query }: { query: PriceQuery }) {
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

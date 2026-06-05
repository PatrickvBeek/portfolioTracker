import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Trash2 } from "lucide-react";
import { Asset } from "pt-domain";
import { useMemo, useState } from "react";
import { useDeleteAsset, useGetAssets } from "../../../userDataContext";
import { Button } from "../../ui/Button";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { AssetPriceHistory } from "./AssetPriceHistory";
import { styles } from "./AssetTable.styles";
import { SymbolConnectionIndicator } from "./SymbolConnectionIndicator";

// oxlint-disable-next-line typescript-eslint/no-explicit-any TanStack Table meta is unknown by design
const columnHelper = createColumnHelper<Asset>();

export function AssetTable() {
  const deleteAsset = useDeleteAsset();
  const assetLibrary = useGetAssets();
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (isin: string) => {
    setExpandedRow((prev) => (prev === isin ? null : isin));
  };

  const columns = useMemo<ColumnDef<Asset, any>[]>(
    () => [
      columnHelper.accessor("displayName", {
        header: "Name",
        cell: (info) => (
          <span className={styles.cellName}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("isin", {
        header: "ISIN",
        cell: (info) => (
          <span className={styles.cellIsin}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => {
          const symbol = info.getValue();
          return symbol ? (
            <SymbolConnectionIndicator symbol={symbol} />
          ) : (
            <span className={styles.cellEmpty}>—</span>
          );
        },
      }),
      columnHelper.accessor((a) => a, {
        header: "Actions",
        cell: (info) => (
          <Button
            intent="danger-ghost"
            onClick={(e) => {
              e.stopPropagation();
              setAssetToDelete(info.getValue());
            }}
            aria-label={`Delete ${info.getValue().displayName}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ),
      }),
    ],
    []
  );

  const data = useMemo(
    () => (assetLibrary ? Object.values(assetLibrary) : []),
    [assetLibrary]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!assetLibrary) {
    return null;
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStatePrimary}>No assets in your library.</p>
        <p className={styles.emptyStateSecondary}>
          Add your first asset using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={styles.tableHeaderRow}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.tableHeaderCell}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRow === row.original.isin;

              return (
                <ExpandableRowGroup
                  key={row.id}
                  isExpanded={isExpanded}
                  onToggle={() => toggleRow(row.original.isin)}
                  symbol={row.original.symbol}
                  columnCount={table.getAllLeafColumns().length}
                >
                  <tr
                    className={styles.tableRowExpandable}
                    onClick={() => toggleRow(row.original.isin)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={styles.tableCell}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                </ExpandableRowGroup>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => {
          const isExpanded = expandedRow === row.original.isin;

          return (
            <Collapsible.Root
              key={row.id}
              open={isExpanded}
              onOpenChange={(open) =>
                setExpandedRow(open ? row.original.isin : null)
              }
            >
              <div
                className={
                  isExpanded
                    ? styles.mobileCardExpanded
                    : styles.mobileCardExpandable
                }
              >
                <Collapsible.Trigger asChild>
                  <div className={styles.mobileCardInner}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={styles.mobileLabel}>Name</div>
                        <div className={styles.cellName}>
                          {row.getValue("displayName")}
                        </div>
                      </div>
                      <ChevronDown
                        className={styles.chevron({
                          isExpanded,
                        })}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
                      <div>
                        <div className={styles.mobileLabel}>ISIN</div>
                        <div className={styles.cellIsin}>
                          {row.getValue("isin")}
                        </div>
                      </div>
                      <div>
                        <div className={styles.mobileLabel}>Symbol</div>
                        <div>
                          {row.original.symbol ? (
                            <SymbolConnectionIndicator
                              symbol={row.original.symbol}
                            />
                          ) : (
                            <span className={styles.cellEmpty}>—</span>
                          )}
                        </div>
                      </div>
                      <Button
                        intent="danger-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAssetToDelete(row.original);
                        }}
                        aria-label={`Delete ${row.original.displayName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Collapsible.Trigger>
                <Collapsible.Content className={styles.collapsibleContent}>
                  <AssetPriceHistory symbol={row.original.symbol} />
                </Collapsible.Content>
              </div>
            </Collapsible.Root>
          );
        })}
      </div>

      <div className={styles.footer}>
        Total: <span className={styles.footerCount}>{data.length}</span> Assets
      </div>

      {assetToDelete && (
        <ConfirmationDialog
          open={!!assetToDelete}
          onCancel={() => setAssetToDelete(null)}
          onConfirm={() => {
            deleteAsset(assetToDelete);
            setAssetToDelete(null);
          }}
          title={`Delete Asset '${assetToDelete.displayName}'?`}
          body={`Do you really want to delete the asset '${assetToDelete.displayName}' from your library?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmIntent="danger"
        />
      )}
    </div>
  );
}

function ExpandableRowGroup({
  isExpanded,
  symbol,
  columnCount,
  onToggle,
  children,
}: {
  isExpanded: boolean;
  symbol?: string;
  columnCount: number;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <tr>
        <td
          colSpan={columnCount}
          className={isExpanded ? styles.expandedCell : "p-0"}
        >
          <Collapsible.Root open={isExpanded} onOpenChange={onToggle}>
            <Collapsible.Content className={styles.collapsibleContent}>
              <AssetPriceHistory symbol={symbol} />
            </Collapsible.Content>
          </Collapsible.Root>
        </td>
      </tr>
    </>
  );
}

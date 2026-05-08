import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Asset } from "pt-domain";
import { useMemo, useState } from "react";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import { Trash2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { SymbolConnectionIndicator } from "./SymbolConnectionIndicator";
import { styles } from "./AssetTable.styles";

// oxlint-disable-next-line typescript-eslint/no-explicit-any TanStack Table meta is unknown by design
const columnHelper = createColumnHelper<Asset>();

export function AssetTable() {
  const deleteAsset = useDeleteAsset();
  const assetLibrary = useGetAssets();
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

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
            onClick={() => setAssetToDelete(info.getValue())}
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={styles.tableRow}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.tableCell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className={styles.mobileCard}>
            <div className={styles.mobileCardInner}>
              <div>
                <div className={styles.mobileLabel}>Name</div>
                <div className={styles.cellName}>
                  {row.getValue("displayName")}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className={styles.mobileLabel}>ISIN</div>
                  <div className={styles.cellIsin}>{row.getValue("isin")}</div>
                </div>
                <div>
                  <div className={styles.mobileLabel}>Symbol</div>
                  <div>
                    {row.original.symbol ? (
                      <SymbolConnectionIndicator symbol={row.original.symbol} />
                    ) : (
                      <span className={styles.cellEmpty}>—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.mobileDeleteSection}>
                <Button
                  intent="danger"
                  onClick={() => setAssetToDelete(row.original)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Asset
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        Total: <span className={styles.footerCount}>{data.length}</span> Assets
      </div>

      {assetToDelete && (
        <DeleteAlertDialog
          open={!!assetToDelete}
          onOpenChange={(open) => !open && setAssetToDelete(null)}
          onConfirm={() => {
            deleteAsset(assetToDelete);
          }}
          title={`Delete Asset '${assetToDelete.displayName}'?`}
          body={`Do you really want to delete the asset '${assetToDelete.displayName}' from your library?`}
        />
      )}
    </div>
  );
}

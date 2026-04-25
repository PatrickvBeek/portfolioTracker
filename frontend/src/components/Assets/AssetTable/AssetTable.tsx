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
import { cn } from "../../../utility/cn";
import { Trash2 } from "lucide-react";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { SymbolConnectionIndicator } from "./SymbolConnectionIndicator";

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
          <span className="font-medium text-text">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("isin", {
        header: "ISIN",
        cell: (info) => (
          <span className="font-mono text-sm text-text-muted">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => {
          const symbol = info.getValue();
          return symbol ? (
            <SymbolConnectionIndicator symbol={symbol} />
          ) : (
            <span className="text-text-dim text-sm">—</span>
          );
        },
      }),
      columnHelper.accessor((a) => a, {
        header: "Actions",
        cell: (info) => (
          <button
            type="button"
            onClick={() => setAssetToDelete(info.getValue())}
            className={cn(
              "p-2 rounded-md",
              "text-text-muted hover:text-danger",
              "hover:bg-danger-soft",
              "focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-bg-card",
              "transition-colors duration-150"
            )}
            aria-label={`Delete ${info.getValue().displayName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No assets in your library.</p>
        <p className="text-xs mt-1 text-text-dim">
          Add your first asset using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-bg-elevated border-b border-border"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
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
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border",
                  "hover:bg-bg-elevated/50",
                  "transition-colors duration-150"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
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
          <div
            key={row.id}
            className={cn(
              "p-4 rounded-lg border border-border",
              "bg-bg-card",
              "hover:border-border-focus",
              "transition-colors duration-150"
            )}
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs text-text-muted mb-1">Name</div>
                <div className="font-medium text-text">
                  {row.getValue("displayName")}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-text-muted mb-1">ISIN</div>
                  <div className="font-mono text-sm text-text-muted">
                    {row.getValue("isin")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted mb-1">Symbol</div>
                  <div>
                    {row.original.symbol ? (
                      <SymbolConnectionIndicator symbol={row.original.symbol} />
                    ) : (
                      <span className="text-text-dim text-sm">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(row.original)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md",
                    "text-sm font-medium text-danger",
                    "hover:bg-danger-soft",
                    "focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-bg-card",
                    "transition-colors duration-150"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-text-muted">
        Total: <span className="font-medium text-text">{data.length}</span>{" "}
        Assets
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

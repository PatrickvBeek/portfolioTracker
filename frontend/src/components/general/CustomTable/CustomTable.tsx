import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Cell,
  ColumnDef,
  Header,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { Fragment } from "react";

type TableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
};

function CustomTable<T>({
  data,
  columns,
  renderSubComponent,
  getRowCanExpand,
}: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              sx={{
                backgroundColor: "var(--theme)",
              }}
            >
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  align={getAlignment(header)}
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "var(--font-base)",
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell align={getAlignment(cell)} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {renderSubComponent && row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={row.getVisibleCells().length}>
                    {renderSubComponent({ row })}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
        <TableFooter>
          {table
            .getFooterGroups()
            .some((footerGroup) =>
              footerGroup.headers.some(
                (header) => header.column.columnDef.footer
              )
            ) &&
            table.getFooterGroups().map((footerGroup) => (
              <TableRow
                key={footerGroup.id}
                sx={{
                  backgroundColor: "#e9e9e9",
                  borderTop: "solid",
                }}
              >
                {footerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    align={getAlignment(header)}
                    sx={{
                      color: "black",
                      fontSize: "var(--font-base)",
                      fontWeight: "bold",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

function getAlignment<T>(cell: Cell<T, unknown> | Header<T, unknown>) {
  const meta = cell.column.columnDef.meta as
    | {
        align: "right" | "left" | "center" | undefined;
      }
    | undefined;
  return meta && meta.align;
}

export default CustomTable;

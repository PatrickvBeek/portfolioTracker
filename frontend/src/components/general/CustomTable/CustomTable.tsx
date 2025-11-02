import styled from "@emotion/styled";
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

const StyledHeaderRow = styled(TableRow)`
  background-color: var(--theme);
`;

const StyledHeaderCell = styled(TableCell)`
  color: white;
  font-weight: bold;
  font-size: var(--font-base);
`;

const StyledFooterRow = styled(TableRow)`
  background-color: #e9e9e9;
  border-top: solid;
`;

const StyledFooterCell = styled(TableCell)`
  color: #000000;
  font-size: var(--font-base);
  font-weight: bold;
`;

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
            <StyledHeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <StyledHeaderCell
                  key={header.id}
                  colSpan={header.colSpan}
                  align={getAlignment(header)}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </StyledHeaderCell>
              ))}
            </StyledHeaderRow>
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
              <StyledFooterRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <StyledFooterCell
                    key={header.id}
                    align={getAlignment(header)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </StyledFooterCell>
                ))}
              </StyledFooterRow>
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

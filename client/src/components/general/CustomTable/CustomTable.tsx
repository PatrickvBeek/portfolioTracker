import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReactNode } from "react";

type Disaplayable = string | number | ReactNode;

export type ColDef<T> = {
  header?: Disaplayable;
  footerGetter?: (items: T[]) => Disaplayable;
  alignment?: TableCellProps["align"];
  valueGetter: (item: T) => Disaplayable;
};

type TableProps<T> = {
  columDefs: ColDef<T>[];
  rows: T[];
};

function CustomTable<T>({ rows, columDefs }: TableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "var(--theme)",
            }}
          >
            {columDefs.map((def, i) => (
              <TableCell
                key={def.header?.toString()}
                align={def.alignment}
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "var(--font-base)",
                }}
              >
                {def.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columDefs.map((def) => (
                <TableCell key={def.header?.toString()} align={def.alignment}>
                  {def.valueGetter(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {columDefs.some((def) => def.footerGetter) && (
          <TableFooter>
            <TableRow
              sx={{
                backgroundColor: "#e9e9e9",
              }}
            >
              {columDefs.map(
                (def) =>
                  def.footerGetter && (
                    <TableCell
                      key={def.header?.toString()}
                      align={def.alignment}
                      sx={{
                        color: "black",
                        fontSize: "var(--font-base)",
                      }}
                    >
                      {def.footerGetter(rows)}
                    </TableCell>
                  )
              )}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}

export default CustomTable;

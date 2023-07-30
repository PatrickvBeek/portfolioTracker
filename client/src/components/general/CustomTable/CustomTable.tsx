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

type Item = string | number | ReactNode;

type TableProps = {
  headers: Item[];
  rows: Item[][];
  footers?: Item[];
  alignments?: TableCellProps["align"][];
};

const CustomTable = ({ headers, rows, footers, alignments }: TableProps) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: "var(--theme)",
          }}
        >
          {headers.map((header) => (
            <TableCell
              key={header?.toString()}
              align="center"
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "var(--font-base)",
                padding: "0.75em",
              }}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, i) => (
              <TableCell key={i}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {footers && (
        <TableFooter>
          <TableRow
            sx={{
              backgroundColor: "#e9e9e9",
            }}
          >
            {footers.map((content, i) => (
              <TableCell
                key={i}
                sx={{
                  color: "black",
                  fontSize: "var(--font-base)",
                }}
              >
                {content}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  </TableContainer>
);

export default CustomTable;

import { ReactElement } from "react";
import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import "./Table.css";

const { bemBlock, bemElement } = bemHelper("table");

export type TableEntry = string | ReactElement;

export type TableRow = TableEntry[];

export type TableProps = Props<{
  headers: string[];
  data: TableEntry[][];
  footer?: TableEntry[][];
}>;

const Table = ({ headers, data, footer, className }: TableProps) => {
  return (
    <div className={bemBlock("overflow-container", className)}>
      <table className={bemElement("table")}>
        <thead>
          <tr className={bemElement("header-row")}>
            {headers.map((header) => (
              <th key={header} className={bemElement("header-element")}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[0].toString()} className={bemElement("data-row")}>
              {row.map((entry) => (
                <td
                  key={entry.toString()}
                  className={bemElement("data-element")}
                >
                  {entry}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {footer?.map((row) => (
            <tr key={row[0].toString()} className={bemElement("footer-row")}>
              {row.map((entry) => (
                <th
                  key={entry.toString()}
                  className={bemElement("footer-element")}
                >
                  {entry}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
};

export default Table;

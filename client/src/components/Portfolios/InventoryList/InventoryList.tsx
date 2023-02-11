import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { sumBy } from "lodash";
import { useEffect, useState } from "react";
import {
  getInvestedValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../data/portfolio/portfolio";
import { AssetLibrary, AssetPositions, Portfolio } from "../../../data/types";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import "./InventoryList.css";

const { bemBlock, bemElement } = bemHelper("inventory-list");

export type InventoryListProps = Props<{
  portfolio: string;
}>;

interface InventoryItem {
  asset: string;
  pieces: number;
  invested: number;
  orderFees: number;
}

const columnHelper = createColumnHelper<InventoryItem>();

const columns = [
  columnHelper.accessor("asset", {
    header: "Asset",
    cell: (value) => value.getValue(),
    footer: ({ table }) =>
      `Number of Positions: ${table.getFilteredRowModel().rows.length}`,
  }),
  columnHelper.accessor("pieces", {
    header: "Pieces",
    cell: (value) => value.getValue(),
  }),
  columnHelper.accessor("invested", {
    header: "Invested Value",
    cell: (value) => toPrice(value.getValue()),
    footer: (data) => (
      <span>
        {toPrice(
          sumBy(data.table.getFilteredRowModel().rows, (r) =>
            r.getValue("invested")
          )
        )}
      </span>
    ),
  }),
  columnHelper.accessor("orderFees", {
    header: "Order Fees",
    cell: (value) => toPrice(value.getValue()),
    footer: (data) =>
      toPrice(
        sumBy(data.table.getFilteredRowModel().rows, (r) =>
          r.getValue("orderFees")
        )
      ),
  }),
];

const rightAlignedCols = ["Pieces", "Invested Value", "Order Fees"];

const emptyPortfolio: Portfolio = {
  name: "empty",
  orders: {},
  transactions: [],
};

const emptyAssets = {};

export const InventoryList = ({ portfolio, className }: InventoryListProps) => {
  const portfolioResponse = useGetPortfolios();
  const [showClosed, setShowClosed] = useState(false);
  const positionType: keyof AssetPositions = showClosed ? "closed" : "open";
  const assets = useGetAssets();
  const currPortfolio = portfolioResponse.data?.[portfolio] || emptyPortfolio;
  const [data, setData] = useState(() =>
    getListItemsFromPortfolio(
      currPortfolio,
      assets.data || emptyAssets,
      positionType
    )
  );

  useEffect(() => {
    setData(
      getListItemsFromPortfolio(
        currPortfolio,
        assets.data || emptyAssets,
        positionType
      )
    );
  }, [currPortfolio, assets.data, positionType]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleSwitchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setShowClosed(!showClosed);
  }

  if (!currPortfolio || !assets.data) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <FormControlLabel
        className={bemElement("switch")}
        control={<Switch checked={showClosed} onChange={handleSwitchChange} />}
        label={`show ${showClosed ? "closed" : "open"} Positions`}
        sx={{
          margin: "0",
          "& .MuiSwitch-thumb": {
            backgroundColor: "var(--theme)",
          },
        }}
      />
      <table className={bemElement("table")}>
        <thead className={bemElement("header")}>
          <tr className={bemElement("header-row")}>
            {table.getFlatHeaders().map((header) => (
              <th className={bemElement("header-element")} key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bemElement("body")}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={bemElement("data-row")}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={bemElement("data-cell", {
                    right: rightAlignedCols.includes(
                      cell.column.columnDef.header?.toString() || ""
                    ),
                  })}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className={bemElement("footer")}>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id} className={bemElement("footer-row")}>
              {footerGroup.headers.map((header) => (
                <th key={header.id} className={bemElement("footer-element")}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
};

function getListItemsFromPortfolio(
  portfolio: Portfolio,
  assets: AssetLibrary,
  positionType: keyof AssetPositions
): InventoryItem[] {
  return Object.keys(portfolio.orders)
    .map((isin) => ({
      asset: assets[isin]?.displayName || "asset not found",
      pieces: Number(
        getPiecesOfIsinInPortfolio(portfolio, isin, positionType).toPrecision(4)
      ),
      invested: getInvestedValueOfIsinInPortfolio(
        portfolio,
        isin,
        positionType
      ),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, positionType),
    }))
    .filter((pos) => pos.pieces > 0);
}

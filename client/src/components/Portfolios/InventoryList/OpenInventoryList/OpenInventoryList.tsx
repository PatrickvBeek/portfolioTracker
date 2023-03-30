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
import { sumBy } from "lodash";
import { useEffect, useState } from "react";
import {
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../../data/portfolio/portfolio";
import { AssetLibrary, Portfolio } from "../../../../data/types";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import "../OpenClosedInventoryList.css";

type OpenInventoryListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("open-closed-inventory-list");

interface InventoryItem {
  asset: string;
  pieces: number;
  invested: number;
  orderFees: number;
}

const TABLE_HEADERS = ["Asset", "Pieces", "Initial Value", "Fees"];

export const OpenInventoryList = ({
  className,
  portfolioName,
}: OpenInventoryListProps) => {
  const portfolioQuery = useGetPortfolios();
  const assetQuery = useGetAssets();
  const portfolioData = portfolioQuery.data?.[portfolioName];
  const [rows, setRows] = useState<InventoryItem[]>(
    getInventoryRows(portfolioData, assetQuery.data)
  );

  useEffect(() => {
    setRows(
      getInventoryRows(portfolioQuery.data?.[portfolioName], assetQuery.data)
    );
  }, [portfolioName, portfolioQuery.data, assetQuery.data]);

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Open Positions</div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "var(--theme)",
              }}
            >
              {TABLE_HEADERS.map((header) => (
                <TableCell
                  align="center"
                  key={header}
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
            {rows.map((row) => (
              <TableRow key={row.asset}>
                <TableCell align="left">{row.asset}</TableCell>
                <TableCell align="right">{row.pieces}</TableCell>
                <TableCell align="right">{toPrice(row.invested)}</TableCell>
                <TableCell align="right">{toPrice(row.orderFees)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ backgroundColor: "#eee" }}>
              <TableCell align="left">{`${rows.length} Position${
                rows.length === 1 ? "" : "s"
              }`}</TableCell>
              <TableCell align="right">{""}</TableCell>
              <TableCell align="right">
                {`${toPrice(sumBy(rows, (a) => a.invested))}`}
              </TableCell>
              <TableCell align="right">
                {`${toPrice(sumBy(rows, (a) => a.orderFees))}`}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
  );
};

function getInventoryRows(
  portfolio?: Portfolio,
  assets?: AssetLibrary
): InventoryItem[] {
  if (!(assets && portfolio)) {
    return [];
  }
  return Object.keys(portfolio.orders)
    .map((isin) => ({
      asset: assets[isin]?.displayName || "asset not found",
      pieces: Number(
        getPiecesOfIsinInPortfolio(portfolio, isin, "open").toPrecision(4)
      ),
      invested: getInitialValueOfIsinInPortfolio(portfolio, isin, "open"),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "open"),
    }))
    .filter((pos) => pos.pieces > 0);
}

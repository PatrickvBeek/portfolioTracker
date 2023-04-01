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
  getEndValueOfIsinInPortfolio,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../../data/portfolio/portfolio";
import { getPositions } from "../../../../data/portfolio/portfolioPositions";
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
  initialValue: number;
  endValue: number;
  orderFees: number;
  profit: number;
}

const TABLE_HEADERS = [
  "Asset",
  "Pieces",
  "Initial Value",
  "End Value",
  "Fees",
  "Profit",
];

export const ClosedInventoryList = ({
  className,
  portfolioName,
}: OpenInventoryListProps) => {
  const portfolioQuery = useGetPortfolios();
  const assetQuery = useGetAssets();
  const [rows, setRows] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setRows(
      getInventoryRows(portfolioQuery.data?.[portfolioName], assetQuery.data)
    );
  }, [portfolioName, portfolioQuery.data, assetQuery.data]);

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Closed Positions</div>
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
                <TableCell align="right">{toPrice(row.initialValue)}</TableCell>
                <TableCell align="right">{toPrice(row.endValue)}</TableCell>
                <TableCell align="right">{toPrice(row.orderFees)}</TableCell>
                <TableCell align="right">{toPrice(row.profit)}</TableCell>
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
                {`${toPrice(sumBy(rows, (a) => a.initialValue))}`}
              </TableCell>
              <TableCell align="right">
                {`${toPrice(sumBy(rows, (a) => a.endValue))}`}
              </TableCell>
              <TableCell align="right">
                {`${toPrice(sumBy(rows, (a) => a.orderFees))}`}
              </TableCell>
              <TableCell align="right">
                {`${toPrice(sumBy(rows, (a) => a.profit))}`}
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
        getPiecesOfIsinInPortfolio(portfolio, isin, "closed").toPrecision(4)
      ),
      initialValue: getInitialValueOfIsinInPortfolio(portfolio, isin, "closed"),
      endValue: getEndValueOfIsinInPortfolio(portfolio, isin),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "closed"),
      profit: sumBy(
        getPositions(portfolio.orders[isin])?.closed,
        ({ pieces, buyPrice, sellPrice, orderFee }) =>
          pieces * (sellPrice - buyPrice) - orderFee
      ),
    }))
    .filter((pos) => pos.pieces > 0);
}

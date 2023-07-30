import { sum } from "radash";
import { useEffect, useState } from "react";
import { AssetLibrary } from "../../../../domain/asset/asset.entities";
import {
  getEndValueOfIsinInPortfolio,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../../domain/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../domain/portfolio/portfolio.entities";
import { getPositions } from "../../../../domain/position/position.derivers";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolios } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import CustomTable from "../../../general/CustomTable/CustomTable";
import "../InventoryList.css";

type OpenInventoryListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("inventory-list");

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
  const [data, setData] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setData(
      getInventoryRows(portfolioQuery.data?.[portfolioName], assetQuery.data)
    );
  }, [portfolioName, portfolioQuery.data, assetQuery.data]);

  const rows = data.map((item) => [
    item.asset,
    item.pieces,
    toPrice(item.initialValue),
    toPrice(item.endValue),
    toPrice(item.orderFees),
    toPrice(item.profit),
  ]);

  const footers = [
    `${data.length} Position${rows.length === 1 ? "" : "s"}`,
    "",
    `${toPrice(sum(data, (a) => a.initialValue))}`,
    `${toPrice(sum(data, (a) => a.endValue))}`,
    `${toPrice(sum(data, (a) => a.orderFees))}`,
    `${toPrice(sum(data, (a) => a.profit))}`,
  ];

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Closed Positions</div>
      <CustomTable headers={TABLE_HEADERS} rows={rows} footers={footers} />
    </div>
    // <div className={bemBlock(className)}>
    //   <div className={bemElement("heading")}>Closed Positions</div>
    //   <TableContainer component={Paper}>
    //     <Table>
    //       <TableHead>
    //         <TableRow
    //           sx={{
    //             backgroundColor: "var(--theme)",
    //           }}
    //         >
    //           {TABLE_HEADERS.map((header) => (
    //             <TableCell
    //               align="center"
    //               key={header}
    //               style={{
    //                 color: "white",
    //                 fontWeight: "bold",
    //                 fontSize: "var(--font-base)",
    //                 padding: "0.75em",
    //               }}
    //             >
    //               {header}
    //             </TableCell>
    //           ))}
    //         </TableRow>
    //       </TableHead>
    //       <TableBody>
    //         {rows.map((row) => (
    //           <TableRow key={row.asset}>
    //             <TableCell align="left">{row.asset}</TableCell>
    //             <TableCell align="right">{row.pieces}</TableCell>
    //             <TableCell align="right">{toPrice(row.initialValue)}</TableCell>
    //             <TableCell align="right">{toPrice(row.endValue)}</TableCell>
    //             <TableCell align="right">{toPrice(row.orderFees)}</TableCell>
    //             <TableCell align="right">{toPrice(row.profit)}</TableCell>
    //           </TableRow>
    //         ))}
    //       </TableBody>
    //       <TableFooter>
    //         <TableRow sx={{ backgroundColor: "#eee" }}>
    //           <TableCell align="left">{`${rows.length} Position${
    //             rows.length === 1 ? "" : "s"
    //           }`}</TableCell>
    //           <TableCell align="right">{""}</TableCell>
    //           <TableCell align="right">
    //             {`${toPrice(sum(rows, (a) => a.initialValue))}`}
    //           </TableCell>
    //           <TableCell align="right">
    //             {`${toPrice(sum(rows, (a) => a.endValue))}`}
    //           </TableCell>
    //           <TableCell align="right">
    //             {`${toPrice(sum(rows, (a) => a.orderFees))}`}
    //           </TableCell>
    //           <TableCell align="right">
    //             {`${toPrice(sum(rows, (a) => a.profit))}`}
    //           </TableCell>
    //         </TableRow>
    //       </TableFooter>
    //     </Table>
    //   </TableContainer>
    // </div>
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
      profit: sum(
        getPositions(portfolio.orders[isin])?.closed || [],
        ({ pieces, buyPrice, sellPrice, orderFee }) =>
          pieces * (sellPrice - buyPrice) - orderFee
      ),
    }))
    .filter((pos) => pos.pieces > 0);
}

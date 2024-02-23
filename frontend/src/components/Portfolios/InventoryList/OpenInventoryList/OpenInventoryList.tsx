import { sum } from "radash";
import { useEffect, useState } from "react";
import { AssetLibrary } from "../../../../domain/asset/asset.entities";
import {
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
} from "../../../../domain/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../domain/portfolio/portfolio.entities";
import { getPositionsDividendSum } from "../../../../domain/position/position.derivers";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import CustomTable, { ColDef } from "../../../general/CustomTable/CustomTable";
import "../InventoryList.css";

type OpenInventoryListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("inventory-list");

interface InventoryItem {
  asset: string;
  pieces: number;
  initialValue: number;
  orderFees: number;
  dividends: number;
}

const columDefs: ColDef<InventoryItem>[] = [
  {
    header: "Asset",
    valueGetter: (i) => i.asset,
    footerGetter: (data) =>
      `${data.length} Position${data.length === 1 ? "" : "s"}`,
    alignment: "left",
  },
  {
    header: "Pieces",
    valueGetter: (i) => i.pieces,
    footerGetter: (data) => "",
    alignment: "right",
  },
  {
    header: "Initial Value",
    valueGetter: (i) => toPrice(i.initialValue),
    footerGetter: (data) => toPrice(sum(data, (el) => el.initialValue)),
    alignment: "right",
  },
  {
    header: "Fees",
    valueGetter: (i) => toPrice(i.orderFees),
    footerGetter: (data) => toPrice(sum(data, (el) => el.orderFees)),
    alignment: "right",
  },
  {
    header: "Dividends",
    valueGetter: (i) => toPrice(i.dividends),
    alignment: "right",
    footerGetter: (data) => toPrice(sum(data, (el) => el.dividends)),
  },
];

export const OpenInventoryList = ({
  className,
  portfolioName,
}: OpenInventoryListProps) => {
  const portfolioQuery = useGetPortfolio(portfolioName);
  const assetQuery = useGetAssets();
  const portfolioData = portfolioQuery.data;
  const [data, setData] = useState<InventoryItem[] | undefined>(undefined);

  useEffect(() => {
    setData(getInventoryRows(portfolioQuery.data, assetQuery.data));
  }, [portfolioName, portfolioQuery.data, assetQuery.data]);

  if (!data) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Open Positions</div>
      <CustomTable rows={data} columDefs={columDefs} />
    </div>
  );
};

function getInventoryRows(
  portfolio?: Portfolio,
  assets?: AssetLibrary
): InventoryItem[] | undefined {
  if (!(assets && portfolio)) {
    return undefined;
  }
  return Object.keys(portfolio.orders)
    .map((isin) => ({
      asset: assets[isin]?.displayName || "asset not found",
      pieces: Number(
        getPiecesOfIsinInPortfolio(portfolio, isin, "open").toPrecision(4)
      ),
      initialValue: getInitialValueOfIsinInPortfolio(portfolio, isin, "open"),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "open"),
      dividends: getPositionsDividendSum(portfolio, isin, "open"),
    }))
    .filter((pos) => pos.pieces > 0);
}

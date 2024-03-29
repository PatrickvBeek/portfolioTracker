import { sum } from "radash";
import { useEffect, useState } from "react";
import { AssetLibrary } from "../../../../../../domain/src/asset/asset.entities";
import {
  getEndValueOfIsinInPortfolio,
  getInitialValueOfIsinInPortfolio,
  getOrderFeesOfIsinInPortfolio,
  getPiecesOfIsinInPortfolio,
  getProfitForIsinInPortfolio,
} from "../../../../../../domain/src/portfolio/portfolio.derivers";
import { Portfolio } from "../../../../../../domain/src/portfolio/portfolio.entities";
import {
  getPositionsDividendSum,
  getTotalTaxesForClosedPosition,
} from "../../../../../../domain/src/position/position.derivers";
import { useGetAssets } from "../../../../hooks/assets/assetHooks";
import { useGetPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import Balance from "../../../general/Balance/Balance";
import CustomTable, { ColDef } from "../../../general/CustomTable/CustomTable";
import "../InventoryList.css";

type OpenInventoryListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("inventory-list");

interface InventoryItem {
  asset: string;
  pieces: number;
  initialValue: number;
  endValue: number;
  orderFees: number;
  dividends: number;
  profit: number;
  taxes: number;
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
    header: "End Value",
    valueGetter: (i) => toPrice(i.endValue),
    footerGetter: (data) => toPrice(sum(data, (el) => el.endValue)),
    alignment: "right",
  },
  {
    header: "Dividends",
    valueGetter: (i) => toPrice(i.dividends),
    footerGetter: (data) => toPrice(sum(data, (el) => el.dividends)),
    alignment: "right",
  },
  {
    header: "Fees",
    valueGetter: (i) => toPrice(i.orderFees),
    footerGetter: (data) => toPrice(sum(data, (el) => el.orderFees)),
    alignment: "right",
  },
  {
    header: "Total Taxes",
    valueGetter: (i) => toPrice(i.taxes),
    footerGetter: (data) => toPrice(sum(data, (el) => el.taxes)),
    alignment: "right",
  },
  {
    header: "Profit",
    valueGetter: (i) => toPrice(i.profit),
    footerGetter: (data) => (
      <Balance value={sum(data, (el) => el.profit)} suffix={"€"} />
    ),
    alignment: "right",
  },
];

export const ClosedInventoryList = ({
  className,
  portfolioName,
}: OpenInventoryListProps) => {
  const portfolioQuery = useGetPortfolio(portfolioName);
  const assetQuery = useGetAssets();
  const [data, setData] = useState<InventoryItem[] | undefined>(undefined);

  useEffect(() => {
    setData(getInventoryRows(portfolioQuery.data, assetQuery.data));
  }, [portfolioName, portfolioQuery.data, assetQuery.data]);

  return data ? (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Closed Positions</div>
      <CustomTable rows={data} columDefs={columDefs} />
    </div>
  ) : null;
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
        getPiecesOfIsinInPortfolio(portfolio, isin, "closed").toPrecision(4)
      ),
      initialValue: getInitialValueOfIsinInPortfolio(portfolio, isin, "closed"),
      endValue: getEndValueOfIsinInPortfolio(portfolio, isin),
      orderFees: getOrderFeesOfIsinInPortfolio(portfolio, isin, "closed"),
      dividends: getPositionsDividendSum(portfolio, isin, "closed"),
      taxes: getTotalTaxesForClosedPosition(portfolio, isin),
      profit: getProfitForIsinInPortfolio(portfolio, isin),
    }))
    .filter((pos) => pos.pieces > 0);
}

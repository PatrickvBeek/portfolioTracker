import { sum } from "radash";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import CustomTable, { ColDef } from "../../../general/CustomTable/CustomTable";
import "../PositionList.css";
import {
  OpenPositionsItem,
  useGetOpenPositionRows,
} from "./OpenPositionsList.logic";

type OpenPositionsListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("position-list");

const columDefs: ColDef<OpenPositionsItem>[] = [
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
    footerGetter: () => "",
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

export const OpenPositionsList = ({
  className,
  portfolioName,
}: OpenPositionsListProps) => {
  const positions = useGetOpenPositionRows(portfolioName);

  return positions ? (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Open Positions</div>
      <CustomTable rows={positions} columDefs={columDefs} />
    </div>
  ) : null;
};

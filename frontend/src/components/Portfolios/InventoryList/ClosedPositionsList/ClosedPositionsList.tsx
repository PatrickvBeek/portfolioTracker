import { sum } from "radash";
import { bemHelper } from "../../../../utility/bemHelper";
import { toPrice } from "../../../../utility/prices";
import { Props } from "../../../../utility/types";
import Balance from "../../../general/Balance/Balance";
import CustomTable, { ColDef } from "../../../general/CustomTable/CustomTable";
import "../PositionList.css";
import {
  ClosedPositionItem,
  useGetClosedPositionRows,
} from "./ClosedPositionsList.logic";

type OpenPositionsListProps = Props<{ portfolioName: string }>;

const { bemBlock, bemElement } = bemHelper("position-list");

const columDefs: ColDef<ClosedPositionItem>[] = [
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

export const ClosedPositionsList = ({
  className,
  portfolioName,
}: OpenPositionsListProps) => {
  const closedPositions = useGetClosedPositionRows(portfolioName);

  return closedPositions ? (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Closed Positions</div>
      <CustomTable rows={closedPositions} columDefs={columDefs} />
    </div>
  ) : null;
};

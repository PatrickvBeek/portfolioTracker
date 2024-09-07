import { Row } from "@tanstack/react-table";
import moment from "moment";
import { sum } from "radash";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import "./PositionBatches.less";
import {
  ClosedBatchListItem,
  OpenBatchListItem,
  useGetClosedBatchesListItems,
  useGetOpenBatchesListItems,
} from "./PositionBatches.logic";
import { PositionsListItem } from "./PositionList";

const { bemBlock, bemElement } = bemHelper("position-batches");

export function PositionBatches({
  row,
  portfolioName,
}: {
  row: Row<PositionsListItem>;
  portfolioName: string;
}): React.ReactElement | null {
  const { batches } = row.original;
  if (!batches) {
    return null;
  }
  const { isin } = row.original;

  return (
    <div className={bemBlock(undefined)}>
      <OpenBatchItems portfolioName={portfolioName} isin={isin} />
      <ClosedBatchItems portfolioName={portfolioName} isin={isin} />
    </div>
  );
}

const OPEN_BATCHES_HEADER_LABELS = [
  "Buy Date",
  "Buy Price",
  "Pieces",
  "Buy Value",
  "Current Value",
  "Fees",
  "Gros Profit",
];

const OpenBatchItems = ({
  portfolioName,
  isin,
}: {
  portfolioName: string;
  isin: string;
}) => {
  const batches = useGetOpenBatchesListItems(portfolioName, isin);

  if (!batches?.length) {
    return null;
  }

  return (
    <div>
      <div className={bemElement("headline")}>Open Batches</div>
      <table className={bemElement("batches-table")}>
        <thead>
          <tr>
            {OPEN_BATCHES_HEADER_LABELS.map((label) => (
              <HeaderCell key={label} numeric={label !== "Buy Date"}>
                {label}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {batches.map((batch, index) => (
            <tr key={index}>
              <td>{moment(batch.buyDate).format("ll")}</td>
              <NumericCell>{toPrice(batch.buyPrice)}</NumericCell>
              <NumericCell>{batch.pieces.toFixed(3)}</NumericCell>
              <NumericCell>{toPrice(batch.buyValue)}</NumericCell>
              <NumericCell>{toPrice(batch.currentValue)}</NumericCell>
              <NumericCell>{toPrice(batch.fees)}</NumericCell>
              <NumericCell>{toPrice(batch.pendingGrosProfit)}</NumericCell>
            </tr>
          ))}
        </tbody>
        <FooterCell />
        <FooterCell />
        <FooterCell>{sumBy(batches, "pieces").toFixed(3)}</FooterCell>
        <FooterCell>{toPrice(sumBy(batches, "buyValue"))}</FooterCell>
        <FooterCell>{toPrice(sumBy(batches, "currentValue"))}</FooterCell>
        <FooterCell>{toPrice(sumBy(batches, "fees"))}</FooterCell>
        <FooterCell>{toPrice(sumBy(batches, "pendingGrosProfit"))}</FooterCell>
      </table>
    </div>
  );
};

const CLOSED_BATCHES_HEADER_LABELS = [
  "Buy Date",
  "Pieces",
  "Buy Value",
  "Sell Value",
  "Fees",
  "Taxes",
  "Net Profit",
];

const ClosedBatchItems = ({
  portfolioName,
  isin,
}: {
  portfolioName: string;
  isin: string;
}) => {
  const batchItems = useGetClosedBatchesListItems(portfolioName, isin);
  if (!batchItems?.length) {
    return null;
  }

  return (
    <div>
      <div className={bemElement("headline")}>Closed Batches</div>
      <table className={bemElement("batches-table")}>
        <thead>
          <tr>
            {CLOSED_BATCHES_HEADER_LABELS.map((label) => (
              <HeaderCell key={label} numeric={label !== "Buy Date"}>
                {label}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {batchItems.map((batch, index) => (
            <tr key={index}>
              <td>{moment(batch.buyDate).format("ll")}</td>
              <NumericCell>{batch.pieces.toFixed(3)}</NumericCell>
              <NumericCell>{toPrice(batch.buyValue)}</NumericCell>
              <NumericCell>{toPrice(batch.sellValue)}</NumericCell>
              <NumericCell>{toPrice(batch.fees)}</NumericCell>
              <NumericCell>{toPrice(batch.taxes)}</NumericCell>
              <NumericCell>{toPrice(batch.netProfit)}</NumericCell>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <FooterCell />
            <FooterCell>{sumBy(batchItems, "pieces").toFixed(3)}</FooterCell>
            <FooterCell>{toPrice(sumBy(batchItems, "buyValue"))}</FooterCell>
            <FooterCell>{toPrice(sumBy(batchItems, "sellValue"))}</FooterCell>
            <FooterCell>{toPrice(sumBy(batchItems, "fees"))}</FooterCell>
            <FooterCell>{toPrice(sumBy(batchItems, "taxes"))}</FooterCell>
            <FooterCell>{toPrice(sumBy(batchItems, "netProfit"))}</FooterCell>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

function HeaderCell({
  children,
  numeric,
}: React.PropsWithChildren<{ numeric: boolean }>) {
  return (
    <th
      className={bemElement("column-header", {
        numeric,
      })}
    >
      {children}
    </th>
  );
}

function NumericCell({ children }: React.PropsWithChildren) {
  return <td className={bemElement("numeric-column")}>{children}</td>;
}

function FooterCell({ children }: React.PropsWithChildren) {
  return <td className={bemElement("column-footer")}>{children}</td>;
}

const sumBy = <T extends OpenBatchListItem | ClosedBatchListItem>(
  batches: T[],
  key: { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
): number => sum(batches, (batch) => batch[key] as number);

import { Row } from "@tanstack/react-table";
import moment from "moment";
import { sum } from "radash";
import { Fragment } from "react/jsx-runtime";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import "./PositionBatches.less";
import {
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

const OpenBatchItems = ({
  portfolioName,
  isin,
}: {
  portfolioName: string;
  isin: string;
}) => {
  const batchListItems = useGetOpenBatchesListItems(portfolioName, isin);

  if (!batchListItems?.length) {
    return null;
  }

  return (
    <div>
      <div className={bemElement("headline")}>Open Batches</div>
      <div className={bemElement("open-batches-table")}>
        {[
          "Buy Date",
          "Pieces",
          "Buy Value",
          "Current Value",
          "Fees",
          "Pending Gros Profit",
        ].map((label) => (
          <div
            key={label}
            className={bemElement("column-header", {
              numeric: label !== "Buy Date",
            })}
          >
            {label}
          </div>
        ))}
        {batchListItems.map(
          (
            {
              buyDate,
              pieces,
              buyValue,
              currentValue,
              fees,
              pendingGrosProfit,
            },
            index
          ) => (
            <Fragment key={index}>
              <div>{moment(buyDate).format("ll")}</div>
              <div className={bemElement("numeric-column")}>
                {pieces.toFixed(3)}
              </div>
              <div className={bemElement("numeric-column")}>
                {toPrice(buyValue)}
              </div>
              <div className={bemElement("numeric-column")}>
                {toPrice(currentValue)}
              </div>
              <div className={bemElement("numeric-column")}>
                {toPrice(fees)}
              </div>
              <div className={bemElement("numeric-column")}>
                {toPrice(pendingGrosProfit)}
              </div>
            </Fragment>
          )
        )}
        <div className={bemElement("column-footer")}></div>
        <div className={bemElement("column-footer")}>
          {sum(batchListItems, (batch) => batch.pieces).toFixed(3)}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchListItems, ({ buyValue }) => buyValue))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchListItems, ({ currentValue }) => currentValue))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchListItems, ({ fees }) => fees))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(
            sum(batchListItems, ({ pendingGrosProfit }) => pendingGrosProfit)
          )}
        </div>
      </div>
    </div>
  );
};

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
      <div className={bemElement("closed-batches-table")}>
        {[
          "Buy Date",
          "Pieces",
          "Buy Value",
          "Sell Value",
          "Fees",
          "Taxes",
          "Net Profit",
        ].map((label) => (
          <div
            key={label}
            className={bemElement("column-header", {
              numeric: label !== "Buy Date",
            })}
          >
            {label}
          </div>
        ))}
        {batchItems.map((batch, index) => (
          <Fragment key={index}>
            <div>{moment(batch.buyDate).format("ll")}</div>
            <div className={bemElement("numeric-column")}>
              {batch.pieces.toFixed(3)}
            </div>
            <div className={bemElement("numeric-column")}>
              {toPrice(batch.buyValue)}
            </div>
            <div className={bemElement("numeric-column")}>
              {toPrice(batch.sellValue)}
            </div>
            <div className={bemElement("numeric-column")}>
              {toPrice(batch.fees)}
            </div>
            <div className={bemElement("numeric-column")}>
              {toPrice(batch.taxes)}
            </div>
            <div className={bemElement("numeric-column")}>
              {toPrice(batch.netProfit)}
            </div>
          </Fragment>
        ))}
        <div className={bemElement("column-footer")} />
        <div className={bemElement("column-footer")}>
          {sum(batchItems, ({ pieces }) => pieces).toFixed(3)}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchItems, ({ buyValue }) => buyValue))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchItems, ({ sellValue }) => sellValue))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchItems, ({ fees }) => fees))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchItems, ({ taxes }) => taxes))}
        </div>
        <div className={bemElement("column-footer")}>
          {toPrice(sum(batchItems, ({ netProfit }) => netProfit))}
        </div>
      </div>
    </div>
  );
};

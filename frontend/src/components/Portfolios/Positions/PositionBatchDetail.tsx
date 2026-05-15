import moment from "moment";
import { toPrice } from "../../../utility/prices";
import Balance from "../../general/Balance/Balance";
import {
  useGetClosedBatchesWithTotals,
  useGetOpenBatchesWithTotals,
  type ClosedBatchListItem,
  type ClosedBatchTotals,
  type OpenBatchListItem,
  type OpenBatchTotals,
} from "./PositionBatchDetail.logic";
import { styles } from "./PositionBatchDetail.styles";

type PositionBatchDetailProps = {
  isin: string;
  portfolioName: string;
};

export function PositionBatchDetail({
  isin,
  portfolioName,
}: PositionBatchDetailProps) {
  const openResult = useGetOpenBatchesWithTotals(portfolioName, isin);
  const closedResult = useGetClosedBatchesWithTotals(portfolioName, isin);

  if (!openResult?.batches.length && !closedResult?.batches.length) {
    return null;
  }

  return (
    <div className={styles.container} data-testid={`batches-${isin}`}>
      {openResult && openResult.batches.length > 0 && (
        <OpenBatchesSection
          batches={openResult.batches}
          totals={openResult.totals}
        />
      )}
      {closedResult && closedResult.batches.length > 0 && (
        <ClosedBatchesSection
          batches={closedResult.batches}
          totals={closedResult.totals}
        />
      )}
    </div>
  );
}

type OpenBatchesSectionProps = {
  batches: OpenBatchListItem[];
  totals: OpenBatchTotals;
};

function OpenBatchesSection({ batches, totals }: OpenBatchesSectionProps) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionHeading}>Open Batches</h4>
      {batches.map((batch, index) => (
        <div key={index} className={styles.batchCard}>
          <div className={styles.batchDate}>
            {moment(batch.buyDate).format("ll")}
          </div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Buy Price</div>
              <div className={styles.metricValue}>
                {toPrice(batch.buyPrice)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Buy Value</div>
              <div className={styles.metricValue}>
                {toPrice(batch.buyValue)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Pieces</div>
              <div className={styles.metricValue}>
                {batch.pieces.toFixed(3)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Current Value</div>
              <div className={styles.metricValue}>
                {toPrice(batch.currentValue)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Fees</div>
              <div className={styles.metricValue}>{toPrice(batch.fees)}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Gros Profit</div>
              <Balance value={batch.pendingGrosProfit} />
            </div>
          </div>
        </div>
      ))}
      <div className={styles.totalsRow}>
        <div className={styles.totalsLabel}>Totals</div>
        <div className={styles.totalsMetrics}>
          <div className={styles.metricBlock} />
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Buy Value</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalBuyValue)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Pieces</div>
            <div className={styles.metricValue}>
              {totals.totalPieces.toFixed(3)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Current Value</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalCurrentValue)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Fees</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalFees)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Gros Profit</div>
            <Balance value={totals.totalProfit} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ClosedBatchesSectionProps = {
  batches: ClosedBatchListItem[];
  totals: ClosedBatchTotals;
};

function ClosedBatchesSection({ batches, totals }: ClosedBatchesSectionProps) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionHeading}>Closed Batches</h4>
      {batches.map((batch, index) => (
        <div key={index} className={styles.batchCard}>
          <div className={styles.batchDate}>
            {moment(batch.buyDate).format("ll")}
          </div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Pieces</div>
              <div className={styles.metricValue}>
                {batch.pieces.toFixed(3)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Buy Value</div>
              <div className={styles.metricValue}>
                {toPrice(batch.buyValue)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Sell Value</div>
              <div className={styles.metricValue}>
                {toPrice(batch.sellValue)}
              </div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Fees</div>
              <div className={styles.metricValue}>{toPrice(batch.fees)}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Taxes</div>
              <div className={styles.metricValue}>{toPrice(batch.taxes)}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Net Profit</div>
              <Balance value={batch.netProfit} />
            </div>
          </div>
        </div>
      ))}
      <div className={styles.totalsRow}>
        <div className={styles.totalsLabel}>Totals</div>
        <div className={styles.totalsMetrics}>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Pieces</div>
            <div className={styles.metricValue}>
              {totals.totalPieces.toFixed(3)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Buy Value</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalBuyValue)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Sell Value</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalSellValue)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Fees</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalFees)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Taxes</div>
            <div className={styles.metricValue}>
              {toPrice(totals.totalTaxes)}
            </div>
          </div>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Net Profit</div>
            <Balance value={totals.totalNetProfit} />
          </div>
        </div>
      </div>
    </div>
  );
}

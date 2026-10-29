import moment from "moment";
import { type ReactNode } from "react";
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

type MetricProps = {
  label: string;
  value: ReactNode;
  plain?: boolean;
};

function Metric({ label, value, plain = false }: MetricProps) {
  return (
    <div className={styles.metricBlock}>
      <div className={styles.metricLabel}>{label}</div>
      {plain ? value : <div className={styles.metricValue}>{value}</div>}
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
            <Metric label="Buy Price" value={toPrice(batch.buyPrice)} />
            <Metric label="Buy Value" value={toPrice(batch.buyValue)} />
            <Metric label="Pieces" value={batch.pieces.toFixed(3)} />
            <Metric label="Current Value" value={toPrice(batch.currentValue)} />
            <Metric label="Fees" value={toPrice(batch.fees)} />
            <Metric
              label="Gros Profit"
              value={<Balance value={batch.pendingGrosProfit} />}
              plain
            />
          </div>
        </div>
      ))}
      <div className={styles.totalsRow}>
        <div className={styles.totalsLabel}>Totals</div>
        <div className={styles.totalsMetrics}>
          <div className={styles.metricBlock} />
          <Metric label="Buy Value" value={toPrice(totals.totalBuyValue)} />
          <Metric label="Pieces" value={totals.totalPieces.toFixed(3)} />
          <Metric
            label="Current Value"
            value={toPrice(totals.totalCurrentValue)}
          />
          <Metric label="Fees" value={toPrice(totals.totalFees)} />
          <Metric
            label="Gros Profit"
            value={<Balance value={totals.totalProfit} />}
            plain
          />
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
            <Metric label="Pieces" value={batch.pieces.toFixed(3)} />
            <Metric label="Buy Value" value={toPrice(batch.buyValue)} />
            <Metric label="Sell Value" value={toPrice(batch.sellValue)} />
            <Metric label="Fees" value={toPrice(batch.fees)} />
            <Metric label="Taxes" value={toPrice(batch.taxes)} />
            <Metric
              label="Net Profit"
              value={<Balance value={batch.netProfit} />}
              plain
            />
          </div>
        </div>
      ))}
      <div className={styles.totalsRow}>
        <div className={styles.totalsLabel}>Totals</div>
        <div className={styles.totalsMetrics}>
          <Metric label="Pieces" value={totals.totalPieces.toFixed(3)} />
          <Metric label="Buy Value" value={toPrice(totals.totalBuyValue)} />
          <Metric label="Sell Value" value={toPrice(totals.totalSellValue)} />
          <Metric label="Fees" value={toPrice(totals.totalFees)} />
          <Metric label="Taxes" value={toPrice(totals.totalTaxes)} />
          <Metric
            label="Net Profit"
            value={<Balance value={totals.totalNetProfit} />}
            plain
          />
        </div>
      </div>
    </div>
  );
}

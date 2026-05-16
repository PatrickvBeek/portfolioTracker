import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { ReactElement } from "react";
import { BatchType } from "pt-domain";
import { toPrice } from "../../../utility/prices";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import Balance from "../../general/Balance/Balance";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import { usePositionData } from "./Positions.logic";
import { styles } from "./PositionCard.styles";

type PositionCardProps = {
  isin: string;
  portfolioName: string;
  batchType: BatchType;
  children: React.ReactNode;
};

export function PositionCard({
  isin,
  portfolioName,
  batchType,
  children,
}: PositionCardProps): ReactElement {
  const assets = useGetAssets();
  const assetName = assets?.[isin]?.displayName ?? "Asset not found...";

  const positionData = usePositionData(portfolioName, isin, batchType);
  const { pieces } = positionData;
  const { data: totalValue, isLoading: isTotalValueLoading } =
    positionData.totalValue;
  const { realizedGains } = positionData;
  const { data: nonRealizedGains, isLoading: isNonRealizedLoading } =
    positionData.nonRealizedGains;
  const { data: profit, isLoading: isProfitLoading } = positionData.profit;

  return (
    <div className={styles.card} aria-label={`position-${isin}`}>
      <div className={styles.cardBody}>
        <div className={styles.header}>
          <span className={styles.assetName}>{assetName}</span>
          <span className={styles.pieces}>
            {Number(pieces.toPrecision(4))} pcs
          </span>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Total Value</div>
            {isTotalValueLoading ? (
              <LoadingIndicator />
            ) : totalValue !== undefined ? (
              <div className={styles.metricValue}>{toPrice(totalValue)}</div>
            ) : (
              <div className={styles.metricValue}>Error...</div>
            )}
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Realized Gains</div>
            <Balance value={realizedGains} />
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Non-Realized</div>
            {isNonRealizedLoading ? (
              <LoadingIndicator />
            ) : nonRealizedGains !== undefined ? (
              <Balance value={nonRealizedGains} />
            ) : (
              <div className={styles.metricValue}>Error...</div>
            )}
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Profit</div>
            {isProfitLoading ? (
              <LoadingIndicator />
            ) : profit !== undefined ? (
              <Balance value={profit} />
            ) : (
              <div className={styles.metricValue}>Error...</div>
            )}
          </div>
        </div>
      </div>

      <Accordion.Root type="single" collapsible>
        <Accordion.Item value={isin}>
          <Accordion.Header className={styles.headerWrapper}>
            <Accordion.Trigger className={styles.trigger}>
              <span>Show batches</span>
              <ChevronDown className={styles.chevron} />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.content}>
            {children}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}

import { BatchType } from "pt-domain";
import { useState } from "react";
import { cn } from "../../../utility/cn";
import { Heading } from "../../ui/Heading";
import { PositionBatchDetail } from "./PositionBatchDetail";
import { PositionCard } from "./PositionCard";
import { PositionSummaryBar } from "./PositionSummaryBar";
import { useGetPositionListItems } from "./Positions.logic";
import { styles } from "./Positions.styles";

type PositionsProps = {
  portfolioName: string;
  className?: string;
};

const TABS = ["Open Positions", "Closed Positions"] as const;

const batchTypeByTab: Record<string, BatchType> = {
  "Open Positions": "open",
  "Closed Positions": "closed",
};

export function Positions({ portfolioName, className }: PositionsProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const batchType = batchTypeByTab[activeTab];
  const items = useGetPositionListItems(portfolioName, batchType);

  return (
    <div className={className}>
      <Heading level="h1">Positions</Heading>
      <div className={styles.tabList} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              styles.tabTrigger,
              activeTab === tab && styles.tabTriggerActive
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className={styles.tabContent}>
        {items && items.length > 0 ? (
          <>
            <div className={styles.cardGrid}>
              {items.map((isin) => (
                <PositionCard
                  key={isin}
                  isin={isin}
                  portfolioName={portfolioName}
                  batchType={batchType}
                >
                  <PositionBatchDetail
                    isin={isin}
                    portfolioName={portfolioName}
                  />
                </PositionCard>
              ))}
            </div>
            <PositionSummaryBar
              portfolioName={portfolioName}
              batchType={batchType}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStatePrimary}>
              No {batchType} positions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

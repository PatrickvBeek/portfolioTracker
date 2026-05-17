import { BatchType } from "pt-domain";
import { useState } from "react";
import { Heading } from "../../ui/Heading";
import { Tabs } from "../../ui/Tabs";
import { PositionBatchDetail } from "./PositionBatchDetail";
import { PositionCard } from "./PositionCard";
import { PositionSummaryBar } from "./PositionSummaryBar";
import { useGetPositionListItems } from "./Positions.logic";
import { styles } from "./Positions.styles";

type PositionsProps = {
  portfolioName: string;
};

type TabValue = "Open" | "Closed";

const TAB_VALUES: readonly string[] = ["Open", "Closed"];

function isTabValue(value: string): value is TabValue {
  return TAB_VALUES.includes(value);
}

function PositionsContent({
  portfolioName,
  batchType,
}: {
  portfolioName: string;
  batchType: BatchType;
}) {
  const items = useGetPositionListItems(portfolioName, batchType);

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStatePrimary}>No {batchType} positions.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cardList}>
        <>
          {items.map((isin) => (
            <PositionCard
              key={isin}
              isin={isin}
              portfolioName={portfolioName}
              batchType={batchType}
            >
              <PositionBatchDetail isin={isin} portfolioName={portfolioName} />
            </PositionCard>
          ))}
          <PositionSummaryBar
            portfolioName={portfolioName}
            batchType={batchType}
          />
        </>
      </div>
    </>
  );
}

export function Positions({ portfolioName }: PositionsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("Open");

  const handleTabChange = (value: string) => {
    if (isTabValue(value)) {
      setActiveTab(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionBody}>
        <Heading level="section">Positions</Heading>
        <Tabs
          entries={[
            {
              value: "Open",
              content: (
                <PositionsContent
                  portfolioName={portfolioName}
                  batchType="open"
                />
              ),
            },
            {
              value: "Closed",
              content: (
                <PositionsContent
                  portfolioName={portfolioName}
                  batchType="closed"
                />
              ),
            },
          ]}
          value={activeTab}
          onValueChange={handleTabChange}
          contentClassName={styles.tabContent}
        />
      </div>
    </div>
  );
}

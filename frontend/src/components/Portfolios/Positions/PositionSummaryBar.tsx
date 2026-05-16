import { isNumber } from "radash";
import { BatchType } from "pt-domain";
import Balance from "../../general/Balance/Balance";
import { toPrice } from "../../../utility/prices";
import { usePositionSummary } from "./Positions.logic";
import { styles } from "./PositionSummaryBar.styles";

type PositionSummaryBarProps = {
  portfolioName: string;
  batchType: BatchType;
};

export function PositionSummaryBar({
  portfolioName,
  batchType,
}: PositionSummaryBarProps) {
  const {
    count,
    totalValue,
    realizedGains: realizedSum,
    nonRealizedGains: nonRealizedSum,
    profit: profitSum,
  } = usePositionSummary(portfolioName, batchType);

  const metrics: { label: string; value: React.ReactNode }[] = [];

  metrics.push({
    label: count === 1 ? "Position" : "Positions",
    value: String(count),
  });

  if (isNumber(totalValue) && !isNaN(totalValue)) {
    metrics.push({ label: "Total", value: toPrice(totalValue) });
  }

  if (isNumber(realizedSum) && !isNaN(realizedSum)) {
    metrics.push({
      label: "Realized",
      value: <Balance value={realizedSum} />,
    });
  }

  if (isNumber(nonRealizedSum) && !isNaN(nonRealizedSum)) {
    metrics.push({
      label: "Unrealized",
      value: <Balance value={nonRealizedSum} />,
    });
  }

  if (isNumber(profitSum) && !isNaN(profitSum)) {
    metrics.push({
      label: "Profit",
      value: <Balance value={profitSum} />,
    });
  }

  return (
    <div className={styles.bar} data-testid="position-summary">
      {metrics.map((metric, i) => (
        <div key={metric.label} className={styles.metric}>
          {i > 0 && <span className={styles.dot}>·</span>}
          <span className={styles.label}>{metric.label}:</span>
          <span>{metric.value}</span>
        </div>
      ))}
    </div>
  );
}

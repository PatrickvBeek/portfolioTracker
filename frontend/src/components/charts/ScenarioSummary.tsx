import type { ScenarioDetails } from "./forecastScenario.logic";
import { styles } from "./ScenarioSummary.styles";

const formatPercent = (percent: number): string => `${percent.toFixed(1)}%`;

export const ScenarioSummary = ({
  displayInfo,
  namePrefix = "",
}: {
  displayInfo: ScenarioDetails["displayInfo"];
  namePrefix?: string;
}) => (
  <div className={styles.details}>
    <p className={styles.name}>
      {namePrefix}
      {displayInfo.name}
    </p>
    <p className={styles.description}>{displayInfo.description}</p>
    <div className="flex gap-2 flex-wrap">
      <span className={styles.chip}>
        Annual return: {formatPercent(displayInfo.annualReturnPercent)}
      </span>
      <span className={styles.chip}>
        Volatility: {formatPercent(displayInfo.annualVolatilityPercent)}
      </span>
    </div>
  </div>
);

import { AlertTriangle } from "lucide-react";
import { ChartContainer } from "../charts/ChartContainer";
import { ForecastChartBody } from "../charts/ForecastChartBody";
import type { ForecastChartData } from "../charts/forecastChartUtils";
import type { WithdrawalPlannerParameters } from "./WithdrawalPlanner.logic";
import { headlineVariants, styles } from "./WithdrawalPlanner.styles";

type WithdrawalPlannerResultProps = {
  isLoading: boolean;
  isError: boolean;
  ruinPercent?: number;
  scenario: WithdrawalPlannerParameters["scenario"];
  chartData: ForecastChartData;
};

export function WithdrawalPlannerResult({
  isLoading,
  isError,
  ruinPercent,
  scenario,
  chartData,
}: WithdrawalPlannerResultProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionBody}>
        {isError ? (
          <p className={styles.headlineMuted}>Error loading forecast.</p>
        ) : ruinPercent === undefined ? (
          <p className={styles.headlineMuted}>
            {isLoading
              ? "Calculating..."
              : "Portfolio historical data insufficient for analysis."}
          </p>
        ) : (
          <>
            <p
              className={headlineVariants({
                tone: ruinPercent >= 50 ? "danger" : "safe",
              })}
            >
              {ruinPercent}% chance your plan runs out of money
            </p>
            <p className={styles.headlineMuted}>
              Based on {scenario === "market" ? "market" : "portfolio"} return
              assumptions.
            </p>
          </>
        )}

        <div className={styles.warning}>
          <AlertTriangle className={styles.warningIcon} />
          <span>
            This forecast assumes the same allocation throughout. If you plan to
            de-risk at retirement, ruin risk may be higher than shown.
          </span>
        </div>

        <ChartContainer isLoading={isLoading}>
          <ForecastChartBody
            data={chartData}
            labels={{
              band: "90% Confidence Interval",
              median: "Market Value (Median)",
            }}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

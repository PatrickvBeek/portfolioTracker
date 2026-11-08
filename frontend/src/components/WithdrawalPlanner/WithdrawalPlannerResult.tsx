import { AlertTriangle } from "lucide-react";
import { asLocaleEuro } from "../charts/chartUtils";
import { ChartContainer } from "../charts/ChartContainer";
import { ForecastChartBody } from "../charts/ForecastChartBody";
import type { ForecastScenario } from "../charts/forecastScenario.logic";
import {
  roundsToZero,
  WITHDRAWAL_CONFIDENCE_PERCENT,
  type WithdrawalPlannerResultData,
  type WithdrawalPlannerResultState,
  type WithdrawalResultSummary,
} from "./WithdrawalPlanner.logic";
import { styles } from "./WithdrawalPlanner.styles";

type WithdrawalPlannerResultProps = {
  state: WithdrawalPlannerResultState;
};

type WithdrawalSummaryProps = {
  summary: WithdrawalResultSummary;
  isUpdating: boolean;
  scenario: ForecastScenario;
};

type WithdrawalResultView = {
  successPercent: number;
  outcomeText: string;
  successLabel: string;
  ruinLabel: string;
  outcomeNote: string;
  retirementText: string;
  planEndText: string;
  simulationNote: string;
  assumptionNote: string;
  showRuinNote: boolean;
};

const describeProbability = (probability: number, percent: number): string => {
  if (probability > 0 && percent === 0) {
    return "<1%";
  }
  if (probability < 1 && percent === 100) {
    return ">99%";
  }

  return `${percent}%`;
};

const formatEuroAmount = (value: number): string =>
  roundsToZero(value) ? "€0" : asLocaleEuro(value, 0);

const buildRuinSentence = (
  summary: Pick<WithdrawalResultSummary, "ruinedCount" | "simulationCount">
): string => {
  if (summary.ruinedCount === 0) {
    return "No simulation ran out of money.";
  }
  if (summary.ruinedCount >= summary.simulationCount) {
    return "All simulations ran out of money.";
  }

  const oneIn = Math.round(summary.simulationCount / summary.ruinedCount);

  return `About 1 in ${oneIn} simulations cannot cover the intended withdrawal.`;
};

const SCENARIO_LABELS: Record<ForecastScenario, string> = {
  market: "market",
  portfolio: "portfolio",
};

const buildWithdrawalResultView = (
  summary: WithdrawalResultSummary,
  scenario: ForecastScenario
): WithdrawalResultView => {
  const successProbability = 1 - summary.ruinedCount / summary.simulationCount;
  const successPercent = Math.round(successProbability * 100);
  const ruinPercent = 100 - successPercent;
  const successLabel = describeProbability(successProbability, successPercent);

  return {
    successPercent,
    outcomeText: `${successLabel} of simulations fund the full plan`,
    successLabel,
    ruinLabel: describeProbability(1 - successProbability, ruinPercent),
    outcomeNote: buildRuinSentence(summary),
    retirementText: formatEuroAmount(summary.atRetirement),
    planEndText: formatEuroAmount(summary.atPlanEnd),
    simulationNote: `Based on ${summary.simulationCount.toLocaleString()} simulations.`,
    assumptionNote: `Based on ${SCENARIO_LABELS[scenario]} return assumptions.`,
    showRuinNote: summary.isMedianRuined,
  };
};

const CHART_LABELS = {
  band: `${WITHDRAWAL_CONFIDENCE_PERCENT}% simulated range`,
  median: "Market value (median, today's euros)",
};

function WithdrawalSummary({
  summary,
  isUpdating,
  scenario,
}: WithdrawalSummaryProps) {
  const view = buildWithdrawalResultView(summary, scenario);

  return (
    <div className="flex flex-col gap-3">
      <h2 className={styles.headline}>{view.outcomeText}</h2>
      <p className={styles.updating} role="status">
        {isUpdating ? "Updating..." : ""}
      </p>
      <div
        className={styles.meter}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={view.successPercent}
        aria-label="Share of simulations that fund the full plan"
        aria-valuetext={view.outcomeText}
      >
        <div
          className={styles.meterSuccess}
          data-testid="meter-success"
          style={{ width: `${view.successPercent}%` }}
        />
        <div className={styles.meterRuin} data-testid="meter-ruin" />
      </div>
      <div className={styles.meterLabels}>
        <span>success {view.successLabel}</span>
        <span>ruin {view.ruinLabel}</span>
      </div>
      <p className={styles.bodyText}>{view.outcomeNote}</p>
      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className={styles.metricLabel}>At retirement</dt>
          <dd className={styles.metricValue}>{view.retirementText}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className={styles.metricLabel}>At plan end</dt>
          <dd className={styles.metricValue}>{view.planEndText}</dd>
        </div>
      </dl>
      {view.showRuinNote && (
        <p className={styles.ruinNote}>
          The median simulation is ruined before the plan ends.
        </p>
      )}
      <p className={styles.note}>{view.simulationNote}</p>
      <p className={styles.headlineMuted}>{view.assumptionNote}</p>
    </div>
  );
}

function ResultContent({
  result,
  isUpdating,
}: {
  result: WithdrawalPlannerResultData;
  isUpdating: boolean;
}) {
  return (
    <>
      <WithdrawalSummary
        summary={result.summary}
        isUpdating={isUpdating}
        scenario={result.scenario}
      />
      {result.chartData.length > 0 && (
        <>
          <div className={styles.warning}>
            <AlertTriangle className={styles.warningIcon} />
            <span>
              This forecast assumes the same allocation throughout. If you plan
              to de-risk at retirement, ruin risk may be higher than shown.
            </span>
          </div>
          <ChartContainer isLoading={false}>
            <ForecastChartBody data={result.chartData} labels={CHART_LABELS} />
          </ChartContainer>
        </>
      )}
    </>
  );
}

export function WithdrawalPlannerResult({
  state,
}: WithdrawalPlannerResultProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionBody}>
        <div className="flex flex-col gap-4">
          {state.status === "loading" && (
            <>
              <p className={styles.headlineMuted}>Calculating...</p>
              <ChartContainer isLoading>
                <ForecastChartBody data={[]} labels={CHART_LABELS} />
              </ChartContainer>
            </>
          )}

          {state.status === "error" && (
            <p className={styles.errorText} role="alert">
              {state.kind === "marketValue"
                ? "Could not load the current portfolio value."
                : "Could not calculate the forecast."}
            </p>
          )}

          {state.status === "unavailable" && (
            <p className={styles.headlineMuted}>
              Portfolio historical data insufficient for analysis.
            </p>
          )}

          {(state.status === "ready" || state.status === "updating") && (
            <ResultContent
              result={state.result}
              isUpdating={state.status === "updating"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { DEFAULT_INFLATION_RATE } from "../../hooks/inflation/inflationHooks";
import {
  hasPositivePhase,
  type WithdrawalPlannerParameters,
  useWithdrawalPlannerData,
} from "./WithdrawalPlanner.logic";
import { WithdrawalPlannerForm } from "./WithdrawalPlannerForm";
import { WithdrawalPlannerResult } from "./WithdrawalPlannerResult";
import { styles } from "./WithdrawalPlanner.styles";

const DEFAULT_PARAMETERS: WithdrawalPlannerParameters = {
  scenario: "market",
  accumulationYears: 10,
  decumulationYears: 20,
  monthlyContribution: null,
  monthlyWithdrawal: null,
  inflationRate: DEFAULT_INFLATION_RATE,
};

const WithdrawalPlanner = ({
  portfolioNames,
}: {
  portfolioNames: string[];
}) => {
  const [params, setParams] =
    useState<WithdrawalPlannerParameters>(DEFAULT_PARAMETERS);
  const {
    state,
    planStart,
    derivedContribution: derivedMonthlyContribution,
  } = useWithdrawalPlannerData(portfolioNames, params);

  const updateParameter = <K extends keyof WithdrawalPlannerParameters>(
    key: K,
    value: WithdrawalPlannerParameters[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const isPlanInvalid = !hasPositivePhase(
    params.accumulationYears,
    params.decumulationYears
  );
  const result =
    state.status === "ready" || state.status === "updating"
      ? state.result
      : undefined;
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const ruinPercent =
    result === undefined
      ? undefined
      : Math.round(
          (result.summary.ruinedCount / result.summary.simulationCount) * 100
        );

  return (
    <div className={styles.container}>
      <WithdrawalPlannerForm
        portfolioNames={portfolioNames}
        planStart={planStart}
        parameters={params}
        derivedMonthlyContribution={derivedMonthlyContribution}
        onParameterChange={updateParameter}
      />
      {!isPlanInvalid && (
        <WithdrawalPlannerResult
          isLoading={isLoading}
          isError={isError}
          ruinPercent={ruinPercent}
          scenario={params.scenario}
          chartData={result?.chartData ?? []}
        />
      )}
    </div>
  );
};

export default WithdrawalPlanner;

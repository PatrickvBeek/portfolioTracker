import { useState } from "react";
import { DEFAULT_INFLATION_RATE } from "../../hooks/inflation/inflationHooks";
import {
  type WithdrawalPlannerParameters,
  useWithdrawalPlannerData,
} from "./WithdrawalPlanner.logic";
import { WithdrawalPlannerForm } from "./WithdrawalPlannerForm";
import { WithdrawalPlannerResult } from "./WithdrawalPlannerResult";
import { styles } from "./WithdrawalPlanner.styles";

const DEFAULT_PARAMETERS: WithdrawalPlannerParameters = {
  scenario: "portfolio",
  accumulationYears: 10,
  accumulationMonths: 0,
  decumulationYears: 20,
  decumulationMonths: 0,
  monthlyContribution: null,
  monthlyWithdrawal: 2000,
  inflationRate: DEFAULT_INFLATION_RATE,
};

const WithdrawalPlanner = ({
  portfolioNames,
}: {
  portfolioNames: string[];
}) => {
  const [params, setParams] =
    useState<WithdrawalPlannerParameters>(DEFAULT_PARAMETERS);
  const { data, isLoading, isError } = useWithdrawalPlannerData(
    portfolioNames,
    params
  );

  const updateParameter = <K extends keyof WithdrawalPlannerParameters>(
    key: K,
    value: WithdrawalPlannerParameters[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const ruinPercent =
    data?.ruinProbability === undefined
      ? undefined
      : Math.round(data.ruinProbability * 100);

  return (
    <div className={styles.container}>
      <WithdrawalPlannerForm
        parameters={params}
        monthlyContributionFallback={data?.monthlyContribution}
        onScenarioChange={(scenario) => updateParameter("scenario", scenario)}
        onParameterChange={updateParameter}
      />
      <WithdrawalPlannerResult
        isLoading={isLoading}
        isError={isError}
        ruinPercent={ruinPercent}
        scenario={params.scenario}
        chartData={data?.chartData ?? []}
      />
    </div>
  );
};

export default WithdrawalPlanner;

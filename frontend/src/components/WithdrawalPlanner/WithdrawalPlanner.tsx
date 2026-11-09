import { useState } from "react";
import { DEFAULT_INFLATION_RATE } from "../../hooks/inflation/inflationHooks";
import {
  type WithdrawalPlannerParameters,
  useWithdrawalPlanner,
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
  const { state, canSimulate, planStart, derivedContribution, simulate } =
    useWithdrawalPlanner(portfolioNames, params);

  const updateParameter = <K extends keyof WithdrawalPlannerParameters>(
    key: K,
    value: WithdrawalPlannerParameters[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  return (
    <div className={styles.container}>
      <WithdrawalPlannerForm
        portfolioNames={portfolioNames}
        planStart={planStart}
        parameters={params}
        derivedMonthlyContribution={derivedContribution}
        canSimulate={canSimulate}
        onParameterChange={updateParameter}
        onSimulate={simulate}
      />
      <WithdrawalPlannerResult state={state} />
    </div>
  );
};

export default WithdrawalPlanner;

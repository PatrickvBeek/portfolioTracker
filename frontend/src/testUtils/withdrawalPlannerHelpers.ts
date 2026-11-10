import type { WithdrawalResultSummary } from "../components/WithdrawalPlanner/WithdrawalPlanner.logic";

export const getTestWithdrawalSummary = (
  overrides: Partial<WithdrawalResultSummary> = {}
): WithdrawalResultSummary => ({
  ruinedCount: 100,
  simulationCount: 1000,
  atRetirement: 250000,
  atPlanEnd: 120000,
  ...overrides,
});

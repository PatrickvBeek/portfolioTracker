import { getFirstOrderTimeStamp, getNumericDateTime } from "pt-domain";
import { unique } from "radash";
import {
  useGetPortfolio,
  useGetPortfolioActivity,
} from "../../../../hooks/portfolios/portfolioHooks";
import { getDefaultTimeAxis } from "../../chartUtils";

export const usePortfolioTimeAxis = (portfolioName: string): number[] => {
  const portfolio = useGetPortfolio(portfolioName);
  const activity = useGetPortfolioActivity(portfolioName);

  const xMin = getFirstOrderTimeStamp(portfolio);

  if (!xMin) {
    return [];
  }

  const portfolioTimestamps = activity.map(getNumericDateTime);
  return unique(
    getDefaultTimeAxis(xMin)
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .sort()
  );
};

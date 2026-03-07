import {
  getAllOrdersInPortfolio,
  getFirstOrderTimeStamp,
  getNumericDateTime,
} from "pt-domain";
import { unique } from "radash";
import { useGetPortfoliosByNames } from "../../../../hooks/portfolios/portfolioHooks";
import { isNotNil } from "../../../../utility/types";
import { getDefaultTimeAxis } from "../../chartUtils";

export const usePortfolioTimeAxis = (portfolioNames: string[]): number[] => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);

  if (portfolios.length === 0) {
    return [];
  }

  const allActivities = portfolios.flatMap(getAllOrdersInPortfolio);

  const xMin = Math.min(
    ...portfolios.map((p) => getFirstOrderTimeStamp(p)).filter(isNotNil)
  );

  if (!xMin || !isFinite(xMin)) {
    return [];
  }

  const portfolioTimestamps = allActivities.map(getNumericDateTime);
  return unique(
    getDefaultTimeAxis(xMin)
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .sort()
  );
};

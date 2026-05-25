import {
  getAllOrdersInPortfolio,
  getFirstOrderTimeStamp,
  getNumericDateTime,
} from "pt-domain";
import { unique } from "radash";
import { useGetPortfoliosByNames } from "../../../../hooks/portfolios/portfolioHooks";
import { isNotNil } from "../../../../utility/types";
import { ChartRange } from "../../chartRange.types";
import { getDefaultTimeAxis, getRangeStart } from "../../chartUtils";

export const usePortfolioTimeAxis = (
  portfolioNames: string[],
  range: ChartRange
): number[] => {
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

  const rangeStart = getRangeStart(xMin, range);

  const portfolioTimestamps = allActivities
    .map(getNumericDateTime)
    .filter((t) => t >= rangeStart);

  return unique(
    getDefaultTimeAxis(xMin, range)
      .concat(portfolioTimestamps)
      .concat(Date.now())
      .toSorted((a, b) => a - b)
  );
};

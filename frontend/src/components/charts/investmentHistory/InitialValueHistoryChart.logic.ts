import {
  getInitialValueSeriesForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "../../../../../domain/src/series/series.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useGetInitialValueSeries = (portfolioName: string) => {
  const portfolioQuery = useGetPortfolio(portfolioName);

  if (!portfolioQuery.data) {
    return undefined;
  }

  const series = getInitialValueSeriesForPortfolio(portfolioQuery.data);

  return removeDuplicatesAtSameTimeStamp(series);
};

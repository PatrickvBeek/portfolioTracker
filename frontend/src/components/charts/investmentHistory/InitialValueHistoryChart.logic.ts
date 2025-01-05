import {
  getInitialValueSeriesForPortfolio,
  removeDuplicatesAtSameTimeStamp,
} from "../../../../../domain/src/series/series.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useGetInitialValueSeries = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  if (!portfolio) {
    return undefined;
  }

  const series = getInitialValueSeriesForPortfolio(portfolio);

  return removeDuplicatesAtSameTimeStamp(series);
};

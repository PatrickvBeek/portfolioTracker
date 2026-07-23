import {
  combinePortfolios,
  GbmParameters,
  getFirstOrderTimeStamp,
  getGeometricBrownianMotionParams,
  getHistoryPointMapper,
  getIsins,
  getRealTimeWeightedReturn,
  getTimeWeightedReturnHistory,
  History,
  percentage2rel,
  rel2percentage,
} from "pt-domain";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../hooks/prices/priceHooks";
import { useInflationIndex } from "../../hooks/inflation/inflationHooks";
import { useGetPortfoliosByNames } from "../../userDataContext";
import { ChartRange } from "./chartRange.types";
import { getDefaultTimeAxis } from "./chartUtils";

export const usePortfolioPriceData = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  return useGetPricesForIsins(getIsins(merged));
};

export const useTimeWeightedReturnHistory = (
  portfolioNames: string[],
  range: ChartRange
): CustomQuery<History<number>> | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const priceMapQuery = usePortfolioPriceData(portfolioNames);
  const xMin = getFirstOrderTimeStamp(merged);

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: getTimeWeightedReturnHistory(
      merged,
      priceMapQuery.data,
      xMin ? getDefaultTimeAxis(xMin, range) : undefined
    ).map(getHistoryPointMapper(rel2percentage)),
  };
};

export const useRealTimeWeightedReturnHistory = (
  portfolioNames: string[],
  range: ChartRange
): CustomQuery<History<number>> | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const priceMapQuery = usePortfolioPriceData(portfolioNames);
  const xMin = getFirstOrderTimeStamp(merged);
  const inflationIndexQuery = useInflationIndex(xMin ?? undefined);
  const inflationIndex = inflationIndexQuery.data ?? [];

  return {
    isLoading: priceMapQuery.isLoading || inflationIndexQuery.isLoading,
    isError: priceMapQuery.isError || inflationIndexQuery.isError,
    data: getRealTimeWeightedReturn(
      merged,
      priceMapQuery.data,
      inflationIndex,
      xMin ? getDefaultTimeAxis(xMin, range) : undefined
    ).map(getHistoryPointMapper(rel2percentage)),
  };
};

export const usePortfolioGeometricBrownianMotionParams = (
  portfolioNames: string[],
  range: ChartRange
): GbmParameters | undefined => {
  const twrHistory = useTimeWeightedReturnHistory(portfolioNames, range);
  const data = twrHistory?.data || [];

  return getGeometricBrownianMotionParams(
    data.map(getHistoryPointMapper(percentage2rel))
  );
};

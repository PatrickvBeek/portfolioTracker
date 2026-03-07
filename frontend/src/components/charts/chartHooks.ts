import {
  combinePortfolios,
  GbmParameters,
  getFirstOrderTimeStamp,
  getGeometricBrownianMotionParams,
  getHistoryPointMapper,
  getIsins,
  getTimeWeightedReturnHistory,
  History,
} from "pt-domain";
import { useGetPortfoliosByNames } from "../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../hooks/prices/priceHooks";
import { getDefaultTimeAxis } from "./chartUtils";

export const usePortfolioPriceData = (portfolioNames: string[]) => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  return useGetPricesForIsins(getIsins(merged));
};

export const useTimeWeightedReturnHistory = (
  portfolioNames: string[]
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
      xMin ? getDefaultTimeAxis(xMin) : undefined
    ).map(getHistoryPointMapper(rel2percentage)),
  };
};

export const usePortfolioGeometricBrownianMotionParams = (
  portfolioNames: string[]
): GbmParameters | undefined => {
  const twrHistory = useTimeWeightedReturnHistory(portfolioNames);
  const data = twrHistory?.data || [];

  return getGeometricBrownianMotionParams(
    data.map(getHistoryPointMapper(percentage2rel))
  );
};

export const rel2percentage = (value: number) => (value - 1) * 100;
export const percentage2rel = (value: number) => value / 100 + 1;

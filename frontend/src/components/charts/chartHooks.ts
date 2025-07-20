import {
  GbmParameters,
  getFirstOrderTimeStamp,
  getGeometricBrownianMotionParams,
  getHistoryPointMapper,
  getIsins,
  getTimeWeightedReturnHistory,
  History,
} from "pt-domain";
import {
  useGetPortfolio,
  usePortfolioSelector,
} from "../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../hooks/prices/priceHooks";
import { getDefaultTimeAxis } from "./chartUtils";

export const usePortfolioPriceData = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return useGetPricesForIsins(getIsins(portfolio));
};

export const useTimeWeightedReturnHistory = (
  portfolioName: string
): CustomQuery<History<number>> | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const priceMapQuery = usePortfolioPriceData(portfolioName);
    const xMin = getFirstOrderTimeStamp(portfolio);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: getTimeWeightedReturnHistory(
        portfolio,
        priceMapQuery.data,
        xMin ? getDefaultTimeAxis(xMin) : undefined
      ).map(getHistoryPointMapper(rel2percentage)),
    };
  });

export const usePortfolioGeometricBrownianMotionParams = (
  portfolioName: string
): GbmParameters | undefined => {
  const twrHistory = useTimeWeightedReturnHistory(portfolioName);
  const data = twrHistory?.data || [];

  return getGeometricBrownianMotionParams(
    data.map(getHistoryPointMapper(percentage2rel))
  );
};

export const rel2percentage = (value: number) => (value - 1) * 100;
export const percentage2rel = (value: number) => value / 100 + 1;

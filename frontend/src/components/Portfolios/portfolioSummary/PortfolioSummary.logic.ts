import {
  getIsins,
  getNonRealizedGains,
  getPiecesOfIsinInPortfolio,
  getPriceAtTimestamp,
  getRealizedGains,
  getTimeWeightedReturn,
  getTotalCashFlowHistory,
} from "pt-domain";
import { sum } from "radash";
import {
  useGetPortfolioActivity,
  usePortfolioSelector,
} from "../../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";

const toYear = (ms: number): number => {
  return ms / (1000 * 60 * 60 * 24 * 365);
};

export const useCashFlow = (portfolioName: string) =>
  usePortfolioSelector(
    portfolioName,
    (p) => getTotalCashFlowHistory(p).at(-1)?.value
  );

export const useRealizedGains = (portfolioName: string) =>
  usePortfolioSelector(portfolioName, (p) => getRealizedGains(p));

export const useNonRealizedGains = (
  portfolioName: string
): CustomQuery | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const priceMap = useGetPricesForIsins(getIsins(portfolio));
    return {
      isError: priceMap.isError,
      isLoading: priceMap.isLoading,
      data: getNonRealizedGains(portfolio, priceMap.data),
    };
  });

export const useMarketValue = (
  portfolioName: string
): CustomQuery | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isins = getIsins(portfolio);
    const priceMapQuery = useGetPricesForIsins(isins);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: sum(
        isins.map(
          (isin) =>
            getPiecesOfIsinInPortfolio(portfolio, isin) *
            (getPriceAtTimestamp(
              portfolio,
              isin,
              Date.now(),
              priceMapQuery.data
            ) ?? NaN)
        )
      ),
    };
  });

export const usePortfolioAge = (portfolioName: string) => {
  const startDate = useGetPortfolioActivity(portfolioName).at(0)?.timestamp;

  return startDate ? toYear(Date.now() - new Date(startDate).getTime()) : NaN;
};

export const useTimeWeightedReturn = (
  portfolioName: string
): CustomQuery | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isins = getIsins(portfolio);
    const priceMapQuery = useGetPricesForIsins(isins);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: getTimeWeightedReturn(portfolio, priceMapQuery.data),
    };
  });

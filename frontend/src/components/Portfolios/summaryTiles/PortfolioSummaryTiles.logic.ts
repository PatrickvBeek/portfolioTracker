import {
  getCashFlowHistory,
  getIsins,
  getNonRealizedGains,
  getPiecesOfIsinInPortfolio,
  getPriceAtTimestamp,
  getRealizedGains,
  getTimeWeightedReturn,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { sum } from "radash";
import {
  useGetPortfolioActivity,
  usePortfolioSelector,
} from "../../../hooks/portfolios/portfolioHooks";
import {
  PriceQuery,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";

const toYear = (ms: number): number => ms / (1000 * 60 * 60 * 24 * 365);

export const useCashFlow = (portfolioName: string) =>
  usePortfolioSelector(
    portfolioName,
    (p) => getCashFlowHistory(p).at(-1)?.value
  );

export const useRealizedGains = (portfolioName: string) =>
  usePortfolioSelector(portfolioName, (p) => getRealizedGains(p));

export const useNonRealizedGains = (
  portfolioName: string
): PriceQuery | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const priceMap = useGetPricesForIsins(getIsins(portfolio));
    return {
      isError: priceMap.isError,
      isLoading: priceMap.isLoading,
      data: getNonRealizedGains(portfolio, priceMap.data),
    };
  });

export const useMarketValue = (portfolioName: string): PriceQuery | undefined =>
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

  return startDate ? toYear(Date.now() - new Date(startDate).getTime()) : 0;
};

export const useTimeWeightedReturn = (
  portfolioName: string
): PriceQuery | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isins = getIsins(portfolio);
    const priceMapQuery = useGetPricesForIsins(isins);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: getTimeWeightedReturn(portfolio, priceMapQuery.data),
    };
  });

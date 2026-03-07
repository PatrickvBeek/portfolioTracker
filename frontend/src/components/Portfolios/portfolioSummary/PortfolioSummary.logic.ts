import {
  combinePortfolios,
  getActivitiesForPortfolio,
  getIsins,
  getNonRealizedGains,
  getNumericDateTime,
  getPiecesOfIsinInPortfolio,
  getPriceAtTimestamp,
  getRealizedGains,
  getTimeWeightedReturn,
  getTotalCashFlowHistory,
} from "pt-domain";
import { min, sum } from "radash";
import { useGetPortfoliosByNames } from "../../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";
import { isNotNil } from "../../../utility/types";

const toYear = (ms: number): number => {
  return ms / (1000 * 60 * 60 * 24 * 365);
};

const sumNullableNumberArray = (values: (number | undefined)[]): number =>
  sum(values.map((v) => v ?? 0));

export const useCashFlow = (portfolioNames: string[]): number => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const cashFlows = portfolios.map(
    (p) => getTotalCashFlowHistory(p).at(-1)?.value
  );
  return sumNullableNumberArray(cashFlows);
};

export const useRealizedGains = (portfolioNames: string[]): number => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const gains = portfolios.map((p) => getRealizedGains(p));
  return sumNullableNumberArray(gains);
};

export const useNonRealizedGains = (
  portfolioNames: string[]
): CustomQuery | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: 0 };
  }

  const allIsins = [...new Set(portfolios.flatMap((p) => getIsins(p)))];
  const priceMap = useGetPricesForIsins(allIsins);

  const nonRealizedGainsPerPortfolio = portfolios.map((portfolio) =>
    getNonRealizedGains(portfolio, priceMap.data)
  );

  return {
    isLoading: priceMap.isLoading,
    isError: priceMap.isError,
    data: sumNullableNumberArray(nonRealizedGainsPerPortfolio),
  };
};

export const useMarketValue = (
  portfolioNames: string[]
): CustomQuery | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: 0 };
  }

  const allIsins = [...new Set(portfolios.flatMap((p) => getIsins(p)))];
  const priceMapQuery = useGetPricesForIsins(allIsins);

  const marketValuePerPortfolio = portfolios.map((portfolio) => {
    const isins = getIsins(portfolio);
    return sum(
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
    );
  });

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: sumNullableNumberArray(marketValuePerPortfolio),
  };
};

export const usePortfolioAge = (portfolioNames: string[]): number => {
  const startDates = useGetPortfoliosByNames(portfolioNames)
    .map(getActivitiesForPortfolio)
    .map((activities) => activities[0])
    .filter(isNotNil)
    .map(getNumericDateTime);

  const earliestStart = min(startDates);
  return earliestStart ? toYear(Date.now() - earliestStart) : NaN;
};

export const useTimeWeightedReturn = (
  portfolioNames: string[]
): CustomQuery | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: undefined };
  }

  const merged = combinePortfolios(portfolios);
  const isins = getIsins(merged);
  const priceMapQuery = useGetPricesForIsins(isins);

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: getTimeWeightedReturn(merged, priceMapQuery.data),
  };
};

import {
  combinePortfolios,
  getAnnualizedReturn,
  getFirstOrderTimeStamp,
  getIsins,
  getMarketValue,
  getNonRealizedGains,
  getPortfolioAgeYears,
  getRealAnnualizedReturn,
  getRealizedGains,
  getTimeWeightedReturn,
  getTotalCashFlow,
} from "pt-domain";
import { max, sum } from "radash";
import { useGetPortfoliosByNames } from "../../../userDataContext";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";
import { useInflationIndex } from "../../../hooks/inflation/inflationHooks";
import { isNotNil } from "../../../utility/types";

const sumNullableNumberArray = (values: (number | undefined)[]): number =>
  sum(values.map((v) => v ?? 0));

export const useCashFlow = (portfolioNames: string[]): number => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const cashFlows = portfolios.map((p) => getTotalCashFlow(p));
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
  const allIsins = [...new Set(portfolios.flatMap((p) => getIsins(p)))];
  const priceMap = useGetPricesForIsins(allIsins);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: 0 };
  }

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
  const allIsins = [...new Set(portfolios.flatMap((p) => getIsins(p)))];
  const priceMapQuery = useGetPricesForIsins(allIsins);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: 0 };
  }

  const marketValuePerPortfolio = portfolios.map((portfolio) =>
    getMarketValue(portfolio, priceMapQuery.data)
  );

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: sumNullableNumberArray(marketValuePerPortfolio),
  };
};

export const usePortfolioAge = (portfolioNames: string[]): number => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const ages = portfolios.map((p) => getPortfolioAgeYears(p)).filter(isNotNil);
  const earliest = max(ages);
  return earliest ?? NaN;
};

export const useTimeWeightedReturn = (
  portfolioNames: string[]
): CustomQuery | undefined => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const isins = getIsins(merged);
  const priceMapQuery = useGetPricesForIsins(isins);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: undefined };
  }

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: getTimeWeightedReturn(merged, priceMapQuery.data),
  };
};

export const useAnnualizedReturn = (
  portfolioNames: string[]
): CustomQuery<number | undefined> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const isins = getIsins(merged);
  const priceMapQuery = useGetPricesForIsins(isins);
  const age = usePortfolioAge(portfolioNames);

  if (portfolios.length === 0) {
    return { isLoading: false, isError: false, data: undefined };
  }

  const twr = getTimeWeightedReturn(merged, priceMapQuery.data);

  return {
    isLoading: priceMapQuery.isLoading,
    isError: priceMapQuery.isError,
    data: twr !== undefined ? getAnnualizedReturn(twr, age) : undefined,
  };
};

export const useRealAnnualizedReturn = (
  portfolioNames: string[]
): CustomQuery<number | undefined> => {
  const portfolios = useGetPortfoliosByNames(portfolioNames);
  const merged = combinePortfolios(portfolios);
  const isins = getIsins(merged);
  const priceMapQuery = useGetPricesForIsins(isins);

  const now = Date.now();
  const startDate = getFirstOrderTimeStamp(merged) ?? undefined;
  const inflationIndexQuery = useInflationIndex(startDate);
  const inflationIndex = inflationIndexQuery.data ?? [];

  if (portfolios.length === 0) {
    return {
      isLoading: inflationIndexQuery.isLoading,
      isError: inflationIndexQuery.isError,
      data: undefined,
    };
  }

  return {
    isLoading: priceMapQuery.isLoading || inflationIndexQuery.isLoading,
    isError: priceMapQuery.isError || inflationIndexQuery.isError,
    data: getRealAnnualizedReturn(
      merged,
      priceMapQuery.data,
      inflationIndex,
      now
    ),
  };
};

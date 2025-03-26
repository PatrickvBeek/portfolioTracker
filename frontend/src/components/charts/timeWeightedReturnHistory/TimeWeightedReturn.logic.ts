import {
  getFirstOrderTimeStamp,
  getIsins,
  getTimeWeightedReturnHistory,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { usePortfolioSelector } from "../../../hooks/portfolios/portfolioHooks";
import {
  CustomQuery,
  useGetPricesForIsins,
} from "../../../hooks/prices/priceHooks";
import { getDefaultTimeAxis } from "../chartUtils";

export const useTimeWeightedReturnHistory = (
  portfolioName: string
): CustomQuery<History<number>> | undefined =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isins = getIsins(portfolio);
    const priceMapQuery = useGetPricesForIsins(isins);
    const xMin = getFirstOrderTimeStamp(portfolio);

    return {
      isLoading: priceMapQuery.isLoading,
      isError: priceMapQuery.isError,
      data: getTimeWeightedReturnHistory(
        portfolio,
        priceMapQuery.data,
        xMin ? getDefaultTimeAxis(xMin) : undefined
      ),
    };
  });

import {
  Order,
  isOrderValidForPortfolio,
  portfolioContainsOrder,
} from "pt-domain";
import { usePortfolioSelector } from "../../../hooks/portfolios/portfolioHooks";

export const useOrderValidation = (portfolioName: string) =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isValid = (order: Order | undefined) =>
      order ? isOrderValidForPortfolio(portfolio, order) : false;

    const isDuplicate = (order: Order | undefined) =>
      order ? portfolioContainsOrder(portfolio, order) : false;

    return { isValid, isDuplicate };
  }) ?? { isDuplicate: () => false, isValid: () => false };

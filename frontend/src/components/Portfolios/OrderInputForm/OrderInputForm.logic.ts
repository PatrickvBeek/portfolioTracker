import { Order } from "pt-domain/src/order/order.entities";
import {
  isOrderValidForPortfolio,
  portfolioContainsOrder,
} from "pt-domain/src/portfolio/portfolio.derivers";
import { usePortfolioSelector } from "../../../hooks/portfolios/portfolioHooks";

export const useOrderValidation = (portfolioName: string) =>
  usePortfolioSelector(portfolioName, (portfolio) => {
    const isValid = (order: Order | undefined) =>
      order ? isOrderValidForPortfolio(portfolio, order) : false;

    const isDuplicate = (order: Order | undefined) =>
      order ? portfolioContainsOrder(portfolio, order) : false;

    return { isValid, isDuplicate };
  }) ?? { isDuplicate: () => false, isValid: () => false };

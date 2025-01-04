import { Order } from "../../../../../domain/src/order/order.entities";
import {
  isOrderValidForPortfolio,
  portfolioContainsOrder,
} from "../../../../../domain/src/portfolio/portfolio.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useOrderValidation = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);

  const isValid = (order: Order | undefined) =>
    order ? isOrderValidForPortfolio(portfolio, order) : false;

  const isDuplicate = (order: Order | undefined) =>
    order ? portfolioContainsOrder(portfolio, order) : false;

  return { isValid, isDuplicate };
};

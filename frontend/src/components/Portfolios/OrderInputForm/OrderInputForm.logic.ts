import { Order } from "../../../../../domain/src/order/order.entities";
import {
  isOrderValidForPortfolio,
  portfolioContainsOrder,
} from "../../../../../domain/src/portfolio/portfolio.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";

export const useOrderValidation = (portfolioName: string) => {
  const { isSuccess: isReady, data } = useGetPortfolio(portfolioName);

  const isValid = (order: Order | undefined) =>
    isReady && order ? isOrderValidForPortfolio(data, order) : false;

  const isDuplicate = (order: Order | undefined) =>
    isReady && order ? portfolioContainsOrder(data, order) : false;

  return { isReady, isValid, isDuplicate };
};

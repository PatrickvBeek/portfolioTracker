import { getIsins } from "pt-domain/src/portfolio/portfolio.derivers";
import { useGetPortfolio } from "../../hooks/portfolios/portfolioHooks";
import { useGetPricesForIsins } from "../../hooks/prices/priceHooks";

export const usePortfolioPriceData = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return useGetPricesForIsins(getIsins(portfolio));
};

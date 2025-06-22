import { getIsins } from "pt-domain";
import { useGetPortfolio } from "../../hooks/portfolios/portfolioHooks";
import { useGetPricesForIsins } from "../../hooks/prices/priceHooks";

export const usePortfolioPriceData = (portfolioName: string) => {
  const portfolio = useGetPortfolio(portfolioName);
  return useGetPricesForIsins(getIsins(portfolio));
};

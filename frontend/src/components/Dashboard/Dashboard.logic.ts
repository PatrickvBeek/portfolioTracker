import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";

export const usePortfolioNames = () => Object.keys(useGetPortfolios());

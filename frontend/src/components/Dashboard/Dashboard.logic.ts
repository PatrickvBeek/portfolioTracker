import { useGetPortfolios } from "../../userDataContext";

export const usePortfolioNames = () => Object.keys(useGetPortfolios());

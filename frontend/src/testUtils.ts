import { useGetAssets } from "./hooks/assets/assetHooks";
import {
  useAddOrderToPortfolio,
  useAddPortfolio,
  useDeletePortfolio,
  useGetPortfolio,
  useGetPortfolios,
} from "./hooks/portfolios/portfolioHooks";

const mockUseGetAssets = useGetAssets as jest.Mock<any>;
jest.mock("./hooks/assets/assetHooks");

const mockUseGetPortfolios = useGetPortfolios as jest.Mock<any>;
const mockUseGetPortfolio = useGetPortfolio as jest.Mock<any>;
const mockUseDeletePortfolio = useDeletePortfolio as jest.Mock<any>;
const mockUseAddPortfolio = useAddPortfolio as jest.Mock<any>;
const mockUseAddOrder = useAddOrderToPortfolio as jest.Mock<any>;
jest.mock("./hooks/portfolios/portfolioHooks");

export {
  mockUseAddOrder,
  mockUseAddPortfolio,
  mockUseDeletePortfolio,
  mockUseGetAssets,
  mockUseGetPortfolio,
  mockUseGetPortfolios,
};

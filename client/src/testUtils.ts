import { useGetAssets } from "./hooks/assets/assetHooks";
import {
  useAddOrderToPortfolio,
  useGetPortfolios,
} from "./hooks/portfolios/portfolioHooks";

const mockUseGetAssets = useGetAssets as jest.Mock<any>;
jest.mock("./hooks/assets/assetHooks");

const mockUseGetPortfolios = useGetPortfolios as jest.Mock<any>;
const mockUseAddOrder = useAddOrderToPortfolio as jest.Mock<any>;
jest.mock("./hooks/portfolios/portfolioHooks");

export { mockUseGetAssets, mockUseGetPortfolios, mockUseAddOrder };

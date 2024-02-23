import { vi } from "vitest";
import { useGetAssets } from "./hooks/assets/assetHooks";
import {
  useAddOrderToPortfolio,
  useAddPortfolio,
  useDeletePortfolio,
  useGetPortfolio,
  useGetPortfolios,
} from "./hooks/portfolios/portfolioHooks";

vi.mock("./hooks/portfolios/portfolioHooks");
vi.mock("./hooks/assets/assetHooks");

const mockUseGetAssets = vi.mocked<any>(useGetAssets);
const mockUseGetPortfolios = vi.mocked<any>(useGetPortfolios);
const mockUseGetPortfolio = vi.mocked<any>(useGetPortfolio);
const mockUseDeletePortfolio = vi.mocked<any>(useDeletePortfolio);
const mockUseAddPortfolio = vi.mocked<any>(useAddPortfolio);
const mockUseAddOrder = vi.mocked<any>(useAddOrderToPortfolio);

export {
  mockUseAddOrder,
  mockUseAddPortfolio,
  mockUseDeletePortfolio,
  mockUseGetAssets,
  mockUseGetPortfolio,
  mockUseGetPortfolios,
};

import { render, screen } from "@testing-library/react";
import { Asset, AssetLibrary } from "../../../../domain/asset/asset.entities";
import {
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestOrder,
} from "../../../../domain/dataHelpers";
import { Portfolio } from "../../../../domain/portfolio/portfolio.entities";
import { mockUseGetAssets, mockUseGetPortfolio } from "../../../../testUtils";
import { OpenInventoryList } from "./OpenInventoryList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "closed-asset", displayName: "Closed Asset" },
  { isin: "open-asset", displayName: "Open Asset" },
]);

const testPortfolioName = "testPortfolio";
const mockPortfolio: Portfolio = {
  name: testPortfolioName,
  orders: getElementsGroupedByAsset([
    getTestOrder({
      asset: "open-asset",
      pieces: 2,
      sharePrice: 10,
      orderFee: 1,
    }),
    getTestOrder({
      asset: "open-asset",
      pieces: -1,
      sharePrice: 11,
      orderFee: 1,
    }),
    getTestOrder({
      asset: "closed-asset",
      pieces: 3,
      sharePrice: 15,
      orderFee: 1,
    }),
    getTestOrder({
      asset: "closed-asset",
      pieces: -3,
      sharePrice: 20,
      orderFee: 1,
    }),
  ]),
};

const portfolioMock = mockUseGetPortfolio;
const assetsMock = mockUseGetAssets;

describe("the open inventory list component", () => {
  beforeEach(() => {
    portfolioMock.mockReturnValue({
      data: mockPortfolio,
      isError: false,
      isLoading: false,
    });
    assetsMock.mockReturnValue({
      data: testAssetLib,
      isError: false,
      isLoading: false,
    });
  });

  it("renders the correct list headers", () => {
    render(<OpenInventoryList portfolioName={testPortfolioName} />);
    expect(
      screen.getAllByRole("columnheader").map((el) => el.textContent)
    ).toEqual(["Asset", "Pieces", "Initial Value", "Fees"]);
  });

  it("renders the correct data", () => {
    render(<OpenInventoryList portfolioName={testPortfolioName} />);
    expect(screen.getAllByRole("cell").map((el) => el.textContent)).toEqual([
      "Open Asset",
      "1",
      "10.00 €",
      "0.50 €",
      "1 Position",
      "",
      "10.00 €",
      "0.50 €",
    ]);
  });
});

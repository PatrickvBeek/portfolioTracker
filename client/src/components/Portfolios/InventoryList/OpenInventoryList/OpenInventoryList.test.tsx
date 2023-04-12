import { render, screen } from "@testing-library/react";
import {
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestOrder,
} from "../../../../data/mockData";
import { Asset, AssetLibrary, PortfolioLibrary } from "../../../../data/types";
import { mockUseGetAssets, mockUseGetPortfolios } from "../../../../testUtils";
import { OpenInventoryList } from "./OpenInventoryList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "closed-asset", displayName: "Closed Asset" },
  { isin: "open-asset", displayName: "Open Asset" },
]);

const testPortfolioName = "testPortfolio";
const mockPortfolioLib: PortfolioLibrary = {
  [testPortfolioName]: {
    name: testPortfolioName,
    transactions: [],
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
  },
};

const portfoliosMock = mockUseGetPortfolios;
const assetsMock = mockUseGetAssets;

describe("the open inventory list component", () => {
  beforeEach(() => {
    portfoliosMock.mockReturnValue({
      data: mockPortfolioLib,
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

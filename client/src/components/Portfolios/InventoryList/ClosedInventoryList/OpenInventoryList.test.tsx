import { render, screen, within } from "@testing-library/react";
import {
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestOrder,
} from "../../../../data/mockData";
import { Asset, AssetLibrary, PortfolioLibrary } from "../../../../data/types";
import { mockUseGetAssets, mockUseGetPortfolios } from "../../../../testUtils";
import { ClosedInventoryList } from "./ClosedInventoryList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "asset1", displayName: "Asset 1" },
  { isin: "asset2", displayName: "Asset 2" },
]);

const testPortfolioName = "testPortfolio";
const mockPortfolioLib: PortfolioLibrary = {
  [testPortfolioName]: {
    name: testPortfolioName,
    transactions: [],
    orders: getElementsGroupedByAsset([
      getTestOrder({
        asset: "asset1",
        pieces: 2,
        sharePrice: 10,
        orderFee: 1,
      }),
      getTestOrder({
        asset: "asset1",
        pieces: -1,
        sharePrice: 11,
        orderFee: 1,
      }),
      getTestOrder({
        asset: "asset2",
        pieces: 3,
        sharePrice: 15,
        orderFee: 1,
      }),
      getTestOrder({
        asset: "asset2",
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

  function getCellTextsForRow(i: number): (string | null)[] {
    return within(screen.getAllByRole("row")[i])
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
  }

  it("renders the correct list headers", () => {
    render(<ClosedInventoryList portfolioName={testPortfolioName} />);
    expect(
      screen.getAllByRole("columnheader").map((el) => el.textContent)
    ).toEqual([
      "Asset",
      "Pieces",
      "Initial Value",
      "End Value",
      "Fees",
      "Profit",
    ]);
  });

  it("renders the correct data", () => {
    render(<ClosedInventoryList portfolioName={testPortfolioName} />);
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(getCellTextsForRow(1)).toEqual([
      "Asset 1",
      "1",
      "10.00 €",
      "11.00 €",
      "1.50 €",
      "-0.50 €",
    ]);
    expect(getCellTextsForRow(2)).toEqual([
      "Asset 2",
      "3",
      "45.00 €",
      "60.00 €",
      "2.00 €",
      "13.00 €",
    ]);
  });

  it("renders the correct footer", () => {
    render(<ClosedInventoryList portfolioName={testPortfolioName} />);

    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(getCellTextsForRow(3)).toEqual([
      "2 Positions",
      "",
      "55.00 €",
      "71.00 €",
      "3.50 €",
      "12.50 €",
    ]);
  });
});

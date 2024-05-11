import { screen, within } from "@testing-library/react";
import {
  Asset,
  AssetLibrary,
} from "../../../../../../domain/src/asset/asset.entities";
import {
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestOrder,
} from "../../../../../../domain/src/dataHelpers";
import { Portfolio } from "../../../../../../domain/src/portfolio/portfolio.entities";
import { getComponentTest } from "../../../../testUtils/componentTestRunner";
import { ClosedInventoryList } from "./ClosedInventoryList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "asset1", displayName: "Asset 1" },
  { isin: "asset2", displayName: "Asset 2" },
]);

const day1 = "2023-12-08";
const day2 = "2023-12-09";
const day3 = "2023-12-10";

const testPortfolioName = "testPortfolio";
const mockPortfolio: Portfolio = {
  name: testPortfolioName,
  orders: getElementsGroupedByAsset([
    getTestOrder({
      asset: "asset1",
      timestamp: day1,
      pieces: 2,
      sharePrice: 10,
      taxes: 0,
      orderFee: 1,
    }),
    getTestOrder({
      asset: "asset1",
      timestamp: day2,
      pieces: -1,
      sharePrice: 11,
      taxes: 0.1,
      orderFee: 1,
    }),
    getTestOrder({
      asset: "asset2",
      timestamp: day1,
      pieces: 3,
      sharePrice: 15,
      orderFee: 1,
      taxes: 0,
    }),
    getTestOrder({
      asset: "asset2",
      timestamp: day3,
      pieces: -3,
      sharePrice: 20,
      orderFee: 1,
      taxes: 1.5,
    }),
  ]),
  dividendPayouts: getElementsGroupedByAsset([
    getTestDividendPayout({
      asset: "asset1",
      timestamp: day3, // will have no effect since no position is open on this day
      dividendPerShare: 100,
      pieces: 100,
    }),
    getTestDividendPayout({
      asset: "asset2",
      timestamp: day2,
      pieces: 3,
      dividendPerShare: 1,
      taxes: 2.5,
    }),
  ]),
};
const testPortfolioLib = { [mockPortfolio.name]: mockPortfolio };

describe("the open inventory list component", () => {
  const test = getComponentTest({
    element: <ClosedInventoryList portfolioName={mockPortfolio.name} />,
    mockData: { portfolioLib: testPortfolioLib, assetLib: testAssetLib },
  });

  beforeAll(() => {
    test.server.listen();
  });
  beforeEach(() => {
    test.server.resetHandlers();
    test.render();
  });
  afterAll(() => test.server.close());

  function getCellTextsForRow(i: number): (string | null)[] {
    return within(screen.getAllByRole("row")[i])
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
  }

  it("renders the correct list headers", async () => {
    expect(
      (await screen.findAllByRole("columnheader")).map((el) => el.textContent)
    ).toEqual([
      "Asset",
      "Pieces",
      "Initial Value",
      "End Value",
      "Dividends",
      "Fees",
      "Total Taxes",
      "Profit",
    ]);
  });

  it("renders the correct data", () => {
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(getCellTextsForRow(1)).toEqual([
      "Asset 1",
      "1",
      "10.00 €",
      "11.00 €",
      "0.00 €",
      "1.50 €",
      "0.10 €",
      "-0.60 €",
    ]);
    expect(getCellTextsForRow(2)).toEqual([
      "Asset 2",
      "3",
      "45.00 €",
      "60.00 €",
      "3.00 €",
      "2.00 €",
      "4.00 €",
      "12.00 €",
    ]);
  });

  it("renders the correct footer", () => {
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(getCellTextsForRow(3)).toEqual([
      "2 Positions",
      "",
      "55.00 €",
      "71.00 €",
      "3.00 €",
      "3.50 €",
      "4.10 €",
      "+11.40 €",
    ]);
  });
});

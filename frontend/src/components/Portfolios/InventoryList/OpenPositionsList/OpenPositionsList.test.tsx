import { screen } from "@testing-library/react";
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
import { customRender } from "../../../../testUtils/componentHelpers";
import { mockNetwork } from "../../../../testUtils/networkMock";
import { OpenPositionsList } from "./OpenPositionsList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "closed-asset", displayName: "Closed Asset" },
  { isin: "open-asset", displayName: "Open Asset" },
]);

const day1 = "2023-12-08";
const day2 = "2023-12-09";
const day3 = "2023-12-10";

const testPortfolioName = "testPortfolio";
const mockPortfolio: Portfolio = {
  name: testPortfolioName,
  orders: getElementsGroupedByAsset([
    getTestOrder({
      timestamp: day1,
      asset: "open-asset",
      pieces: 2,
      sharePrice: 10,
      orderFee: 1,
    }),
    getTestOrder({
      timestamp: day3,
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
  dividendPayouts: getElementsGroupedByAsset([
    getTestDividendPayout({
      timestamp: day2,
      pieces: 2,
      dividendPerShare: 2,
      asset: "open-asset",
    }),
  ]),
};
const mockPortfolioLib = { [mockPortfolio.name]: mockPortfolio };

describe("the open inventory list component", () => {
  mockNetwork({ portfolioLib: mockPortfolioLib, assetLib: testAssetLib });

  it("renders the correct list headers", async () => {
    customRender({
      component: <OpenPositionsList portfolioName={testPortfolioName} />,
    });
    expect(
      (await screen.findAllByRole("columnheader")).map((el) => el.textContent)
    ).toEqual(["Asset", "Pieces", "Initial Value", "Fees", "Dividends"]);
  });

  it("renders the correct data", async () => {
    customRender({
      component: <OpenPositionsList portfolioName={testPortfolioName} />,
    });

    expect(
      (await screen.findAllByRole("cell"))
        .map((el) => el.textContent)
        .map((s) => s?.replace(/\u00A0/g, " "))
    ).toEqual([
      "Open Asset",
      "1",
      "10.00 €",
      "0.50 €",
      "2.00 €",
      "1 Position",
      "",
      "10.00 €",
      "0.50 €",
      "2.00 €",
    ]);
  });
});

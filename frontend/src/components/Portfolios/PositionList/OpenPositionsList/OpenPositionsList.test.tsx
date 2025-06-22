import { screen, within } from "@testing-library/react";
import {
  Asset,
  AssetLibrary,
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestOrder,
  Portfolio,
} from "pt-domain";
import {
  customRender,
  customWaitFor,
  getTextWithNonBreakingSpaceReplaced,
} from "../../../../testUtils/componentHelpers";
import { setUserData } from "../../../../testUtils/localStorage";
import { getCellTextsForRow } from "../testUtils";
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
      sharePrice: 6,
      orderFee: 2,
      taxes: 0,
    }),
    getTestOrder({
      timestamp: day3,
      asset: "open-asset",
      pieces: -1,
      sharePrice: 10,
      orderFee: 1,
      taxes: 0.5,
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
      taxes: 0,
    }),
  ]),
};

const testPortfolioLib = { [mockPortfolio.name]: mockPortfolio };

describe("the open inventory list component", () => {
  setUserData({
    portfolios: testPortfolioLib,
    assets: testAssetLib,
  });

  it("renders the correct list headers", async () => {
    customRender({
      component: <OpenPositionsList portfolioName={testPortfolioName} />,
    });
    expect(
      (await screen.findAllByRole("columnheader")).map((el) => el.textContent)
    ).toEqual([
      "Asset",
      "Pieces",
      "Total Value",
      "Realized Gains",
      "Non-Realized Gains",
      "Profit",
    ]);
  });

  it("renders the correct data", async () => {
    customRender({
      component: <OpenPositionsList portfolioName={testPortfolioName} />,
    });

    await customWaitFor(async () =>
      expect(await getCellTextsForRow(1)).toEqual([
        "Open Asset",
        "1",
        "10.00 €",
        "+5.50 €",
        "+3.00 €",
        "+8.50 €",
      ])
    );

    await customWaitFor(async () =>
      expect(await getCellTextsForRow(2)).toEqual([
        "1 Position",
        "",
        "10.00 €",
        "+5.50 €",
        "+3.00 €",
        "+8.50 €",
      ])
    );
  });

  it("can expand to show batches", async () => {
    const { user } = customRender({
      component: <OpenPositionsList portfolioName={mockPortfolio.name} />,
    });

    const expandButton = await screen.findByRole("button", {
      name: /expand row/,
    });

    await user.click(expandButton);

    const batchesTable = screen.getByRole("table", {
      name: "open-batches-table",
    });

    expect(batchesTable).toBeInTheDocument();

    const [headerRow, ...dataRows] = within(batchesTable).getAllByRole("row");

    expect(
      within(headerRow)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual([
      "Buy Date",
      "Buy Price",
      "Pieces",
      "Buy Value",
      "Current Value",
      "Fees",
      "Gros Profit",
    ]);

    expect(
      dataRows.map((row) =>
        within(row)
          .getAllByRole("cell")
          .map((cell) => getTextWithNonBreakingSpaceReplaced(cell))
      )
    ).toEqual([
      [
        "Dec 8, 2023",
        "6.00 €",
        "1.000",
        "6.00 €",
        "10.00 €",
        "1.00 €",
        "4.00 €",
      ],
      ["", "", "1.000", "6.00 €", "10.00 €", "1.00 €", "4.00 €"],
    ]);
  });
});

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
import { ClosedPositionsList } from "./ClosedPositionsList";

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

describe("the ClosedPositionList component", () => {
  setUserData({
    portfolios: testPortfolioLib,
    assets: testAssetLib,
  });

  it("renders the correct list headers", async () => {
    customRender({
      component: <ClosedPositionsList portfolioName={mockPortfolio.name} />,
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
      component: <ClosedPositionsList portfolioName={mockPortfolio.name} />,
    });

    expect(await screen.findAllByRole("row")).toHaveLength(3);
    await customWaitFor(async () =>
      expect(await getCellTextsForRow(1)).toEqual([
        "Asset 2",
        "3",
        "60.00 €",
        "+12.00 €",
        "0.00 €",
        "+12.00 €",
      ])
    );
  });

  it("renders the correct footer", async () => {
    customRender({
      component: <ClosedPositionsList portfolioName={mockPortfolio.name} />,
    });

    expect(await screen.findAllByRole("row")).toHaveLength(3);
    expect(await getCellTextsForRow(2)).toEqual([
      "1 Position",
      "",
      "60.00 €",
      "+12.00 €",
      "0.00 €",
      "+12.00 €",
    ]);
  });

  it("can expand to show batches", async () => {
    const { user } = customRender({
      component: <ClosedPositionsList portfolioName={mockPortfolio.name} />,
    });

    const expandButton = await screen.findByRole("button", {
      name: /expand row/,
    });

    await user.click(expandButton);

    const batchesTable = screen.getByRole("table", {
      name: "closed-batches-table",
    });

    expect(batchesTable).toBeInTheDocument();

    const [headerRow, ...dataRows] = within(batchesTable).getAllByRole("row");

    expect(
      within(headerRow)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual([
      "Buy Date",
      "Pieces",
      "Buy Value",
      "Sell Value",
      "Fees",
      "Taxes",
      "Net Profit",
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
        "3.000",
        "45.00 €",
        "60.00 €",
        "2.00 €",
        "1.50 €",
        "11.50 €",
      ],
      ["", "3.000", "45.00 €", "60.00 €", "2.00 €", "1.50 €", "11.50 €"],
    ]);
  });
});

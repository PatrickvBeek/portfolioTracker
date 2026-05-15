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
} from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import { Positions } from "./Positions";

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
      timestamp: day1,
      asset: "closed-asset",
      pieces: 3,
      sharePrice: 15,
      orderFee: 1,
      taxes: 0,
    }),
    getTestOrder({
      timestamp: day2,
      asset: "closed-asset",
      pieces: -3,
      sharePrice: 20,
      orderFee: 1,
      taxes: 0,
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

const replaceNbsp = (text: string | null) =>
  text?.replace(/\u00A0/g, " ") ?? "";

describe("the Positions component", () => {
  setUserData({
    portfolios: testPortfolioLib,
    assets: testAssetLib,
  });

  describe("open positions tab", () => {
    it("renders the open positions tab by default", async () => {
      customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const openTab = await screen.findByRole("tab", {
        name: /Open Positions/,
      });
      expect(openTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders metric labels on the position card", async () => {
      customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const card = await screen.findByLabelText("position-open-asset");

      expect(within(card).getByText("Total Value")).toBeInTheDocument();
      expect(within(card).getByText("Realized Gains")).toBeInTheDocument();
      expect(within(card).getByText("Non-Realized")).toBeInTheDocument();
      expect(within(card).getByText("Profit")).toBeInTheDocument();
    });

    it("renders the correct data for the open position", async () => {
      customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const card = await screen.findByLabelText("position-open-asset");

      await customWaitFor(() => {
        expect(within(card).getByText("1 pcs")).toBeInTheDocument();
      });

      await customWaitFor(() => {
        const valueElements = within(card).getAllByText(/10\.00/);
        expect(valueElements.length).toBeGreaterThanOrEqual(1);
        expect(replaceNbsp(valueElements[0].textContent)).toContain("10.00 €");
      });

      expect(
        within(card).getByText((content) => content.includes("5.50"))
      ).toBeInTheDocument();
      expect(
        within(card).getByText((content) => content.includes("3.00"))
      ).toBeInTheDocument();
      expect(
        within(card).getByText((content) => content.includes("8.50"))
      ).toBeInTheDocument();
    });

    it("renders the summary bar with position count and totals", async () => {
      customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      await screen.findByLabelText("position-open-asset");

      const summaryBar = await screen.findByTestId("position-summary");

      expect(within(summaryBar).getByText("1")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Total:")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Realized:")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Profit:")).toBeInTheDocument();
    });

    it("can expand to show open batches", async () => {
      const { user } = customRender({
        component: <Positions portfolioName={mockPortfolio.name} />,
      });

      const card = await screen.findByLabelText("position-open-asset");

      const trigger = within(card).getByRole("button", {
        name: /Show batches/,
      });

      await user.click(trigger);

      const batchDetail = await screen.findByTestId("batches-open-asset");

      expect(within(batchDetail).getByText("Open Batches")).toBeInTheDocument();

      expect(within(batchDetail).getByText("Buy Price")).toBeInTheDocument();
      expect(
        within(batchDetail).getAllByText("Gros Profit").length
      ).toBeGreaterThanOrEqual(1);

      await customWaitFor(() => {
        expect(
          within(batchDetail).getAllByText("Dec 8, 2023").length
        ).toBeGreaterThanOrEqual(1);
      });

      expect(
        within(batchDetail).getAllByText("6.00 €").length
      ).toBeGreaterThanOrEqual(1);
      expect(
        within(batchDetail).getAllByText("1.000").length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("closed positions tab", () => {
    it("switches to closed positions tab and renders the position", async () => {
      const { user } = customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const closedTab = await screen.findByRole("tab", {
        name: /Closed Positions/,
      });

      await user.click(closedTab);

      expect(closedTab).toHaveAttribute("aria-selected", "true");

      const card = await screen.findByLabelText("position-closed-asset");

      await customWaitFor(() => {
        expect(within(card).getByText("3 pcs")).toBeInTheDocument();
      });

      await customWaitFor(() => {
        const valueElements = within(card).getAllByText(/60\.00/);
        expect(valueElements.length).toBeGreaterThanOrEqual(1);
        expect(replaceNbsp(valueElements[0].textContent)).toContain("60.00 €");
      });

      expect(within(card).getByText("Closed Asset")).toBeInTheDocument();
    });

    it("renders the summary bar for closed positions", async () => {
      const { user } = customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const closedTab = await screen.findByRole("tab", {
        name: /Closed Positions/,
      });

      await user.click(closedTab);

      await screen.findByLabelText("position-closed-asset");

      const summaryBar = await screen.findByTestId("position-summary");

      expect(within(summaryBar).getByText("1")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Total:")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Realized:")).toBeInTheDocument();
      expect(within(summaryBar).getByText("Profit:")).toBeInTheDocument();
    });

    it("can expand to show closed batches", async () => {
      const { user } = customRender({
        component: <Positions portfolioName={testPortfolioName} />,
      });

      const closedTab = await screen.findByRole("tab", {
        name: /Closed Positions/,
      });

      await user.click(closedTab);

      const card = await screen.findByLabelText("position-closed-asset");

      const trigger = within(card).getByRole("button", {
        name: /Show batches/,
      });

      await user.click(trigger);

      const batchDetail = await screen.findByTestId("batches-closed-asset");

      expect(
        within(batchDetail).getByText("Closed Batches")
      ).toBeInTheDocument();

      expect(
        within(batchDetail).getAllByText("Sell Value").length
      ).toBeGreaterThanOrEqual(1);
      expect(
        within(batchDetail).getAllByText("Net Profit").length
      ).toBeGreaterThanOrEqual(1);

      await customWaitFor(() => {
        expect(
          within(batchDetail).getAllByText("Dec 8, 2023").length
        ).toBeGreaterThanOrEqual(1);
      });

      expect(
        within(batchDetail).getAllByText("3.000").length
      ).toBeGreaterThanOrEqual(1);
    });
  });
});

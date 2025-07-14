import { screen } from "@testing-library/react";
import {
  Asset,
  AssetLibrary,
  getElementsByIsin,
  getElementsGroupedByAsset,
  getTestOrder,
  Portfolio,
} from "pt-domain";
import { describe, expect, it } from "vitest";
import {
  customRender,
  customWaitFor,
} from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import ActivityList from "./ActivityList";

const testAssetLib: AssetLibrary = getElementsByIsin<Asset>([
  { isin: "TEST123456789", displayName: "Test Stock" },
]);

const testPortfolioName = "Test Portfolio";

describe("ActivityList overselling prevention", () => {
  it("blocks deletion when overselling would occur and shows error dialog", async () => {
    const orders = [
      getTestOrder({
        asset: "TEST123456789",
        pieces: 10,
        timestamp: "2024-01-01T10:00:00.000Z",
        sharePrice: 100,
        orderFee: 5,
        taxes: 0,
      }),
      getTestOrder({
        asset: "TEST123456789",
        pieces: 5,
        timestamp: "2024-01-02T10:00:00.000Z",
        sharePrice: 110,
        orderFee: 5,
        taxes: 0,
      }),
      getTestOrder({
        asset: "TEST123456789",
        pieces: -12,
        timestamp: "2024-01-03T10:00:00.000Z",
        sharePrice: 120,
        orderFee: 5,
        taxes: 1,
      }),
    ];

    const testPortfolio: Portfolio = {
      name: testPortfolioName,
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    };

    const testPortfolioLib = { [testPortfolio.name]: testPortfolio };

    setUserData({
      portfolios: testPortfolioLib,
      assets: testAssetLib,
    });

    const { user } = customRender({
      component: <ActivityList portfolio={testPortfolioName} />,
    });

    await customWaitFor(() => {
      expect(screen.getByText("Portfolio Activity")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons).toHaveLength(3);

    await user.click(deleteButtons[2]);

    expect(screen.getByText("Delete Activity?")).toBeInTheDocument();

    const confirmDeleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(confirmDeleteButton);

    expect(screen.getByText("Cannot Delete Transaction")).toBeInTheDocument();

    const okButton = screen.getByRole("button", { name: "OK" });
    await user.click(okButton);

    await customWaitFor(() => {
      expect(
        screen.queryByText("Cannot Delete Transaction")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Portfolio Activity")).toBeInTheDocument();
  });

  it("allows deletion when no overselling would occur", async () => {
    const orders = [
      getTestOrder({
        asset: "TEST123456789",
        pieces: 10,
        timestamp: "2024-01-01T10:00:00.000Z",
        sharePrice: 100,
        orderFee: 5,
        taxes: 0,
      }),
      getTestOrder({
        asset: "TEST123456789",
        pieces: -5,
        timestamp: "2024-01-02T10:00:00.000Z",
        sharePrice: 120,
        orderFee: 5,
        taxes: 1,
      }),
    ];

    const testPortfolio: Portfolio = {
      name: testPortfolioName,
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    };

    const testPortfolioLib = { [testPortfolio.name]: testPortfolio };

    setUserData({
      portfolios: testPortfolioLib,
      assets: testAssetLib,
    });

    const { user } = customRender({
      component: <ActivityList portfolio={testPortfolioName} />,
    });

    expect(screen.getByText("Portfolio Activity")).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]); // order are rendered in reverse order

    expect(screen.getByText("Delete Activity?")).toBeInTheDocument();

    const confirmDeleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(confirmDeleteButton);

    expect(
      screen.queryByText("Cannot Delete Transaction")
    ).not.toBeInTheDocument();

    expect(screen.queryByText("Delete Activity?")).not.toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
  });
});

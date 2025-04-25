import {
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain/src/dataHelpers";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../../testUtils/networkMock";
import { useTimeWeightedReturn } from "./PortfolioSummary.logic";

const portfolioName = "test-portfolio";

describe("with online prices", () => {
  vi.setSystemTime("2001-01-01");
  const twrPortfolio = getTestPortfolio({
    name: portfolioName,
    orders: getTestOrdersGroupedByAsset([
      {
        asset: "a1",
        pieces: 10,
        sharePrice: 100,
        taxes: 0,
        orderFee: 0,
        timestamp: new Date("2000-01-01").toISOString(),
      },
      {
        asset: "a1",
        pieces: 0.8606,
        sharePrice: 116.2,
        taxes: 0,
        orderFee: 0,
        timestamp: new Date("2000-06-01").toISOString(),
      },
    ]),
  });

  setUserData({
    portfolios: { [portfolioName]: twrPortfolio },
    assets: {
      a1: {
        displayName: "something",
        isin: "a1",
        symbol: "a",
      },
    },
  });

  mockNetwork({
    prices: getPriceResponse("a", [
      [new Date("2000-06-01"), 115.2], // on purpose not the same as in the transaction
      [new Date("2000-12-31"), 109.75],
    ]),
  });

  it("useTimeWeightedReturn", async () => {
    const { result } = customRenderHook(() =>
      useTimeWeightedReturn(portfolioName)
    );

    await customWaitFor(() => expect(result.current?.isLoading).toBe(false));

    expect(result.current?.data).toBe(1.0975);
  });
});

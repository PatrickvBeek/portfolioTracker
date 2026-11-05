import { getTestOrdersGroupedByAsset, getTestPortfolio } from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../testUtils/componentHelpers";
import { getPriceResponse, mockNetwork } from "../../testUtils/networkMock";
import { useForecastScenarioParams } from "./forecastScenario.logic";

const DAY1 = "2020-03-01";
const DAY2 = "2020-04-01";
const TODAY = "2020-06-01";

vi.setSystemTime(TODAY);

mockNetwork({
  prices: getPriceResponse("ABC", [
    [new Date(DAY1), 100],
    [new Date(DAY2), 105],
    [new Date(TODAY), 115.76],
  ]),
});

describe("useForecastScenarioParams", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns market scenario details when scenario is "market"', () => {
    const { result } = customRenderHook(() =>
      useForecastScenarioParams(["TEST"], "market")
    );

    expect(result.current?.params).toEqual({
      mu: 0.00721,
      sigma: 0.044,
    });
    expect(result.current?.displayInfo.name).toBe("Market (S&P 500)");
    expect(result.current?.displayInfo.description).toBe(
      "Based on historical S&P 500 performance since 1985"
    );
    expect(result.current?.displayInfo.annualReturnPercent).toBeCloseTo(
      9.04,
      1
    );
    expect(result.current?.displayInfo.annualVolatilityPercent).toBeCloseTo(
      16.46,
      1
    );
  });

  it('returns undefined when scenario is "portfolio" but no portfolio exists', () => {
    const { result } = customRenderHook(() =>
      useForecastScenarioParams(["nonexistent"], "portfolio")
    );

    expect(result.current).toBeUndefined();
  });

  it('returns portfolio scenario details when scenario is "portfolio" and portfolio exists', async () => {
    localStorage.setItem(
      "assets",
      JSON.stringify({
        ABC: {
          isin: "ABC",
          symbol: "ABC",
          name: "ABC Corp",
        },
      })
    );

    const portfolio = getTestPortfolio({
      name: "testPortfolio",
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "ABC",
          pieces: 10,
          sharePrice: 100,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY1,
        },
        {
          asset: "ABC",
          pieces: 5,
          sharePrice: 101,
          taxes: 0,
          orderFee: 0,
          timestamp: DAY2,
        },
      ]),
    });

    localStorage.setItem(
      "portfolios",
      JSON.stringify({
        testPortfolio: portfolio,
      })
    );

    const { result, queryClient } = customRenderHook(() =>
      useForecastScenarioParams(["testPortfolio"], "portfolio")
    );
    await customWaitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(result.current).toBeDefined();
    expect(result.current?.params).toBeDefined();
    expect(result.current?.displayInfo.name).toBe("Your Portfolio");
    expect(result.current?.displayInfo.description).toBe(
      "Based on your portfolio's historical performance"
    );
    expect(typeof result.current?.displayInfo.annualReturnPercent).toBe(
      "number"
    );
  });
});

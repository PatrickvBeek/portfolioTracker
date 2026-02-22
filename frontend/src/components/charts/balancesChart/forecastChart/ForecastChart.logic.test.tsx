import {
  getTestOrder,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  renderAndAwaitQueryHook,
} from "../../../../testUtils/componentHelpers";
import {
  getPriceResponse,
  mockNetwork,
} from "../../../../testUtils/networkMock";

import {
  FORECAST_CONFIDENCE_LEVELS,
  FORECAST_HORIZONS,
  ForecastParameters,
  useForecastChartData,
  useForecastScenarioParams,
} from "./ForecastChart.logic";

const DAY1 = "2020-03-01";
const DAY2 = "2020-04-01";
const DAY3 = "2020-05-01";
const TODAY = "2020-06-01";

vi.setSystemTime(TODAY);

mockNetwork({
  prices: getPriceResponse("ABC", [
    [new Date(DAY1), 100],
    [new Date(DAY2), 105],
    [new Date(DAY3), 110.25],
    [new Date(TODAY), 115.76],
  ]),
});

describe("ForecastChart.logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("useForecastScenarioParams", () => {
    it('returns market scenario details when scenario is "market"', () => {
      const { result } = customRenderHook(() =>
        useForecastScenarioParams("TEST", "market")
      );

      expect(result.current).toEqual({
        params: { mu: 0.00721, sigma: 0.044 },
        displayInfo: {
          name: "Market (S&P 500)",
          description: "Based on historical S&P 500 performance since 1985",
          annualReturn: "9.0%",
          volatility: "16.5%",
          isAvailable: true,
        },
      });
    });

    it('returns undefined when scenario is "portfolio" but no portfolio exists', () => {
      const { result } = customRenderHook(() =>
        useForecastScenarioParams("nonexistent", "portfolio")
      );

      expect(result.current).toBeUndefined();
    });

    it('returns portfolio scenario details when scenario is "portfolio" and portfolio exists', () => {
      // Set up asset library first
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

      const { result } = customRenderHook(() =>
        useForecastScenarioParams("testPortfolio", "portfolio")
      );

      expect(result.current).toBeDefined();
      expect(result.current?.params).toBeDefined();
      expect(result.current?.displayInfo.name).toBe("Your Portfolio");
      expect(result.current?.displayInfo.description).toBe(
        "Based on your portfolio's historical performance"
      );
      expect(result.current?.displayInfo.isAvailable).toBe(true);
    });
  });

  describe("useForecastChartData", () => {
    const baseParams: ForecastParameters = {
      scenario: "market",
      timeHorizon: FORECAST_HORIZONS["5Y"],
      monthlyContribution: 0,
      confidenceLevel: FORECAST_CONFIDENCE_LEVELS["68"],
      inflationRate: 0.02,
    };

    it("returns empty data when portfolio doesn't exist", () => {
      customRenderHook(() => useForecastChartData("nonexistent", baseParams));

      // Since we mock the runGeometricBrownianMotionForecast, even with no portfolio
      // it will return data if scenario is "market". Let's test with portfolio scenario instead.
      const portfolioParams: ForecastParameters = {
        ...baseParams,
        scenario: "portfolio",
      };

      const { result: portfolioResult } = customRenderHook(() =>
        useForecastChartData("nonexistent", portfolioParams)
      );

      expect(portfolioResult.current.data).toEqual([]);
    });

    it("returns forecast chart data for market scenario with minimal portfolio", () => {
      // Create minimal portfolio to avoid complex price hook interactions
      const portfolio = getTestPortfolio({
        name: "testPortfolio",
        orders: {
          ABC: [
            getTestOrder({
              asset: "ABC",
              pieces: 1,
              sharePrice: 100,
              timestamp: DAY1,
            }),
          ],
        },
      });

      localStorage.setItem(
        "portfolios",
        JSON.stringify({
          testPortfolio: portfolio,
        })
      );

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

      const { result } = customRenderHook(() =>
        useForecastChartData("testPortfolio", baseParams)
      );

      expect(result.current.data).toHaveLength(60); // 5y * 12months

      const firstDataPoint = result.current.data![0];
      expect(firstDataPoint).toHaveProperty("timestamp");
      expect(firstDataPoint.median).toBeCloseTo(100.6, 0);
      expect(firstDataPoint.mean).toBeCloseTo(100.7, 0);
    });
    it("returns forecast chart data for 'portfolio' scenario with minimal portfolio", async () => {
      // Create minimal portfolio to avoid complex price hook interactions
      const portfolio = getTestPortfolio({
        name: "testPortfolio",
        orders: {
          ABC: [
            getTestOrder({
              asset: "ABC",
              pieces: 1,
              sharePrice: 100,
              timestamp: DAY1,
            }),
          ],
        },
      });

      localStorage.setItem(
        "portfolios",
        JSON.stringify({
          testPortfolio: portfolio,
        })
      );

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

      const { data } = await renderAndAwaitQueryHook(() =>
        useForecastChartData("testPortfolio", {
          ...baseParams,
          scenario: "portfolio",
        })
      );

      expect(data).toHaveLength(60); // 5y * 12months

      const firstDataPoint = data![0];
      expect(firstDataPoint).toHaveProperty("timestamp");
      expect(firstDataPoint.median).toBeCloseTo(122, -0.3);
    });

    it("should handle different time horizons correctly", () => {
      const portfolio = getTestPortfolio({
        name: "testPortfolio",
        orders: {},
      });

      localStorage.setItem(
        "portfolios",
        JSON.stringify({
          testPortfolio: portfolio,
        })
      );

      const paramsWithDifferentHorizon: ForecastParameters = {
        ...baseParams,
        timeHorizon: FORECAST_HORIZONS["1Y"],
      };

      const { result } = customRenderHook(() =>
        useForecastChartData("testPortfolio", paramsWithDifferentHorizon)
      );

      expect(result.current.data).toHaveLength(12);
    });
  });
});

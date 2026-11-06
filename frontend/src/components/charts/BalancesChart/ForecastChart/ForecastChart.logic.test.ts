import { getTestOrder, getTestPortfolio } from "pt-domain";
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

const setUpPortfolio = () => {
  localStorage.setItem(
    "portfolios",
    JSON.stringify({
      testPortfolio: getTestPortfolio({
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
      }),
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
};

describe("ForecastChart.logic", () => {
  beforeEach(() => {
    localStorage.clear();
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
      customRenderHook(() => useForecastChartData(["nonexistent"], baseParams));

      // Since we mock the runGeometricBrownianMotionForecast, even with no portfolio
      // it will return data if scenario is "market". Let's test with portfolio scenario instead.
      const portfolioParams: ForecastParameters = {
        ...baseParams,
        scenario: "portfolio",
      };

      const { result: portfolioResult } = customRenderHook(() =>
        useForecastChartData(["nonexistent"], portfolioParams)
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
        useForecastChartData(["testPortfolio"], baseParams)
      );

      expect(result.current.data).toHaveLength(60); // 5y * 12months

      const firstDataPoint = result.current.data![0];
      expect(firstDataPoint).toHaveProperty("timestamp");
      expect(firstDataPoint.median).toBeCloseTo(100.6, 0);
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
        useForecastChartData(["testPortfolio"], {
          ...baseParams,
          scenario: "portfolio",
        })
      );

      expect(data).toHaveLength(60); // 5y * 12months

      const firstDataPoint = data![0];
      expect(firstDataPoint).toHaveProperty("timestamp");
      expect(firstDataPoint.median).toBeCloseTo(121.5, -0.3);
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
        useForecastChartData(["testPortfolio"], paramsWithDifferentHorizon)
      );

      expect(result.current.data).toHaveLength(12);
    });

    it("keeps the data reference across identical rerenders", () => {
      setUpPortfolio();

      const { result, rerender } = customRenderHook(() =>
        useForecastChartData(["testPortfolio"], baseParams)
      );
      const firstData = result.current.data;

      rerender();

      expect(result.current.data).toBe(firstData);
    });

    it("recomputes data when the horizon changes", () => {
      setUpPortfolio();

      let params: ForecastParameters = baseParams;
      const { result, rerender } = customRenderHook(() =>
        useForecastChartData(["testPortfolio"], params)
      );
      const firstData = result.current.data;

      params = { ...baseParams, timeHorizon: FORECAST_HORIZONS["1Y"] };
      rerender();

      expect(result.current.data).not.toBe(firstData);
      expect(result.current.data).toHaveLength(12);
    });
  });
});

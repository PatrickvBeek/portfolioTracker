import { getTestOrdersGroupedByAsset } from "../dataHelpers";
import { Portfolio } from "../portfolio/portfolio.entities";
import { getInvestedValueSeriesForPortfolio } from "./series.derivers";

describe("the series operation", () => {
  describe("getInvestedValueSeries", () => {
    it("returns the correct series for a portfolio having orders", () => {
      const TEST_PORTFOLIO: Portfolio = {
        name: "test-portfolio",
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "asset1",
            timestamp: "2023-01-01",
            sharePrice: 10,
            pieces: 2,
          },
          {
            asset: "asset2",
            timestamp: "2023-01-02",
            pieces: 1,
            sharePrice: 5,
          },
          {
            asset: "asset1",
            timestamp: "2023-01-03",
            pieces: -1,
            sharePrice: 11,
          },
        ]),
      };

      expect(getInvestedValueSeriesForPortfolio(TEST_PORTFOLIO)).toEqual({
        seriesType: "invested_value",
        data: [
          [new Date("2023-01-01"), 20],
          [new Date("2023-01-02"), 25],
          [new Date("2023-01-03"), 14],
        ],
      });
    });
  });
});

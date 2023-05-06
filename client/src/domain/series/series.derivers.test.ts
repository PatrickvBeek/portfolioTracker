import { getTestOrdersGroupedByAsset } from "../dataHelpers";
import { Portfolio } from "../portfolio/portfolio.entities";
import { getInitialValueSeriesForPortfolio } from "./series.derivers";

const DAY1 = "2023-01-01";
const DAY2 = "2023-01-02";
const DAY3 = "2023-01-03";

describe("the series operation", () => {
  describe("getInvestedValueSeries", () => {
    it("returns the correct series for a portfolio having orders", () => {
      const TEST_PORTFOLIO: Portfolio = {
        name: "test-portfolio",
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "asset1",
            timestamp: DAY1,
            sharePrice: 10,
            pieces: 2,
          },
          {
            asset: "asset2",
            timestamp: DAY2,
            pieces: 1,
            sharePrice: 5,
          },
          {
            asset: "asset1",
            timestamp: DAY3,
            pieces: -1,
            sharePrice: 11,
          },
        ]),
      };

      expect(getInitialValueSeriesForPortfolio(TEST_PORTFOLIO)).toEqual([
        { timestamp: new Date(DAY1).getTime(), value: 20 },
        { timestamp: new Date(DAY2).getTime(), value: 25 },
        { timestamp: new Date(DAY3).getTime(), value: 15 },
      ]);
    });
  });
});

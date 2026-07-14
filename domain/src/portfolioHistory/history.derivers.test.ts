import {
  getTestDividendPayoutsGroupedByAsset,
  getTestOrdersGroupedByAsset,
  getTestPortfolio,
} from "../dataHelpers";
import { getTotalCashFlowHistory } from "../portfolio/portfolio.derivers";
import {
  anchorHistoryToBenchmarkStart,
  anchorHistoryToRangeStart,
  getBenchmarkHistory,
  History,
} from "./history.derivers";

const DAY1 = "2023-01-01";
const DAY2 = "2023-01-02";
const DAY3 = "2023-01-03";

const ts = (date: string) => new Date(date).getTime();

const priceHistory: History<number> = [
  { timestamp: ts(DAY1), value: 100 },
  { timestamp: ts(DAY2), value: 110 },
  { timestamp: ts(DAY3), value: 121 },
];

const percentageHistory: History<number> = [
  { timestamp: ts(DAY1), value: 0 },
  { timestamp: ts(DAY2), value: 10 },
  { timestamp: ts(DAY3), value: 20 },
];

describe("the history operation", () => {
  describe("getCashFlowHistory", () => {
    it("buying and selling without costs", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 11,
            pieces: 2,
            timestamp: DAY1,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 0,
            taxes: 0,
          },
          {
            asset: "a2",
            sharePrice: 25,
            pieces: 1,
            timestamp: DAY2,
            orderFee: 0,
            taxes: 0,
          },
        ]),
      });

      expect(getTotalCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 80 },
          { timestamp: DAY1, value: 102 },
          { timestamp: DAY2, value: 90 },
          { timestamp: DAY2, value: 115 },
        ])
      );
    });

    it("buying and selling with costs", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 5,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 5,
            taxes: 0.5,
          },
          {
            asset: "a2",
            sharePrice: 25,
            pieces: 1,
            timestamp: DAY2,
            orderFee: 10,
            taxes: 0.25,
          },
        ]),
      });

      expect(getTotalCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 85 },
          { timestamp: DAY2, value: 78.5 },
          { timestamp: DAY2, value: 113.75 },
        ])
      );
    });

    it("with orders and dividends", () => {
      const portfolio = getTestPortfolio({
        orders: getTestOrdersGroupedByAsset([
          {
            asset: "a1",
            sharePrice: 10,
            pieces: 8,
            timestamp: DAY1,
            orderFee: 5,
            taxes: 0,
          },
          {
            asset: "a1",
            sharePrice: 12,
            pieces: -1,
            timestamp: DAY2,
            orderFee: 5,
            taxes: 0.5,
          },
        ]),
        dividendPayouts: getTestDividendPayoutsGroupedByAsset([
          {
            asset: "a1",
            dividendPerShare: 3,
            pieces: 8,
            taxes: 4,
            timestamp: DAY3,
          },
        ]),
      });

      expect(getTotalCashFlowHistory(portfolio)).toEqual(
        getValuesAsHistory([
          { timestamp: DAY1, value: 85 },
          { timestamp: DAY2, value: 78.5 },
          { timestamp: DAY3, value: 58.5 },
        ])
      );
    });
  });
});

describe("anchorHistoryToRangeStart", () => {
  it("reanchors history relative to the anchor point and filters after rangeStart", () => {
    const anchorPoint = { timestamp: ts(DAY2), value: 10 };
    const result = anchorHistoryToRangeStart(
      percentageHistory,
      anchorPoint,
      ts(DAY2)
    );

    expectHistoryToEqual(result, [
      { timestamp: ts(DAY2), value: 0 },
      { timestamp: ts(DAY3), value: 9.090909090909 },
    ]);
  });

  it("falls back to a simple filter when no anchor point is given", () => {
    const result = anchorHistoryToRangeStart(
      percentageHistory,
      undefined,
      ts(DAY2)
    );

    expectHistoryToEqual(result, [
      { timestamp: ts(DAY2), value: 10 },
      { timestamp: ts(DAY3), value: 20 },
    ]);
  });
});

describe("anchorHistoryToBenchmarkStart", () => {
  it("reanchors history to the first benchmark timestamp", () => {
    const benchmarkHistory: History<number> = [
      { timestamp: ts(DAY2), value: 5 },
      { timestamp: ts(DAY3), value: 8 },
    ];
    const result = anchorHistoryToBenchmarkStart(
      percentageHistory,
      benchmarkHistory
    );

    expectHistoryToEqual(result, [
      { timestamp: ts(DAY2), value: 0 },
      { timestamp: ts(DAY3), value: 9.090909090909 },
    ]);
  });

  it("returns the history unchanged when benchmark history is empty", () => {
    const result = anchorHistoryToBenchmarkStart(percentageHistory, []);

    expect(result).toBe(percentageHistory);
  });
});

describe("getBenchmarkHistory", () => {
  it("maps prices to relative percentages starting at portfolioStartTime", () => {
    const result = getBenchmarkHistory(priceHistory, ts(DAY1));

    expectHistoryToEqual(result, [
      { timestamp: ts(DAY1), value: 0 },
      { timestamp: ts(DAY2), value: 10 },
      { timestamp: ts(DAY3), value: 21 },
    ]);
  });

  it("starts at the first point at or after portfolioStartTime", () => {
    const result = getBenchmarkHistory(priceHistory, ts(DAY2));

    expectHistoryToEqual(result, [
      { timestamp: ts(DAY2), value: 0 },
      { timestamp: ts(DAY3), value: 10 },
    ]);
  });

  it("returns an empty history when no point reaches portfolioStartTime", () => {
    const result = getBenchmarkHistory(priceHistory, ts("2023-01-04"));

    expect(result).toEqual([]);
  });
});

const expectHistoryToEqual = (
  actual: History<number>,
  expected: History<number>
): void => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((point, i) => {
    expect(point.timestamp).toBe(expected[i].timestamp);
    expect(point.value).toBeCloseTo(expected[i].value, 6);
  });
};

const getValuesAsHistory = (values: { timestamp: string; value: number }[]) =>
  values.map(({ timestamp, value }) => ({
    timestamp: new Date(timestamp).getTime(),
    value,
  }));

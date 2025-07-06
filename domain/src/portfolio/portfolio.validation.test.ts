import { describe, expect, it } from "vitest";
import {
  getElementsGroupedByAsset,
  getTestDividendPayout,
  getTestDividendPayoutsGroupedByAsset,
  getTestOrder,
  getTestPortfolio,
} from "../dataHelpers";
import { canDeleteActivity } from "./portfolio.validation";

describe("canDeleteActivity", () => {
  const testAsset = "test-asset";

  it("allows deletion of dividend payouts", () => {
    const dividend = getTestDividendPayout({
      asset: testAsset,
      pieces: 10,
      timestamp: "2024-01-01",
    });

    const portfolio = getTestPortfolio({
      orders: {},
      dividendPayouts: getTestDividendPayoutsGroupedByAsset([
        { asset: testAsset, pieces: 10, timestamp: "2024-01-01" },
      ]),
    });

    expect(canDeleteActivity(portfolio, dividend)).toBe(true);
  });

  it("allows deletion of order when no overselling occurs", () => {
    const orders = [
      getTestOrder({ asset: testAsset, pieces: 10, timestamp: "2024-01-01" }),
      getTestOrder({ asset: testAsset, pieces: -5, timestamp: "2024-01-02" }),
    ];

    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    });

    expect(canDeleteActivity(portfolio, orders[1])).toBe(true);
  });

  it("prevents deletion of buy order when it would cause overselling", () => {
    const orders = [
      getTestOrder({ asset: testAsset, pieces: 10, timestamp: "2024-01-01" }),
      getTestOrder({ asset: testAsset, pieces: 5, timestamp: "2024-01-02" }),
      getTestOrder({ asset: testAsset, pieces: -12, timestamp: "2024-01-03" }),
    ];

    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    });

    // Deleting first buy order would leave only 5 pieces, but we sold 12
    expect(canDeleteActivity(portfolio, orders[0])).toBe(false);
  });

  it("allows deletion of sell order even if it creates positive balance", () => {
    const orders = [
      getTestOrder({ asset: testAsset, pieces: 10, timestamp: "2024-01-01" }),
      getTestOrder({ asset: testAsset, pieces: -5, timestamp: "2024-01-02" }),
    ];

    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    });

    expect(canDeleteActivity(portfolio, orders[1])).toBe(true);
  });

  it("handles complex FIFO scenarios correctly", () => {
    const orders = [
      getTestOrder({ asset: testAsset, pieces: 10, timestamp: "2024-01-01" }),
      getTestOrder({ asset: testAsset, pieces: -8, timestamp: "2024-01-02" }),
      getTestOrder({ asset: testAsset, pieces: 15, timestamp: "2024-01-03" }),
      getTestOrder({ asset: testAsset, pieces: -12, timestamp: "2024-01-04" }),
    ];

    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    });

    // Total: +10 -8 +15 -12 = +5 remaining
    // Deleting first buy order: -8 +15 -12 = -5 (overselling)
    expect(canDeleteActivity(portfolio, orders[0])).toBe(false);

    // Deleting last sell order: +10 -8 +15 = +17 (valid)
    expect(canDeleteActivity(portfolio, orders[3])).toBe(true);
  });

  it("prevents deletion when intermediate overselling would occur despite positive final balance", () => {
    const orders = [
      getTestOrder({ asset: testAsset, pieces: 5, timestamp: "2024-01-01" }),
      getTestOrder({ asset: testAsset, pieces: 10, timestamp: "2024-01-02" }),
      getTestOrder({ asset: testAsset, pieces: -8, timestamp: "2024-01-03" }),
      getTestOrder({ asset: testAsset, pieces: 5, timestamp: "2024-01-04" }),
    ];

    const portfolio = getTestPortfolio({
      orders: getElementsGroupedByAsset(orders),
      dividendPayouts: {},
    });

    // Original portfolio is valid:
    // Day 1: +5 = 5 total
    // Day 2: +10 = 15 total
    // Day 3: -8 = 7 total
    // Day 4: +5 = 12 total

    // But deleting the second buy order would cause intermediate overselling:
    // Remaining: +5, -8, +5
    // Day 1: +5 = 5 total
    // Day 3: -8 = -3 total (overselling)
    // Day 4: +5 = 2 total (positive final balance, but intermediate overselling occurred)
    expect(canDeleteActivity(portfolio, orders[1])).toBe(false);

    // Deleting the sell order should be fine
    expect(canDeleteActivity(portfolio, orders[2])).toBe(true);

    // Deleting other buy orders should be fine
    expect(canDeleteActivity(portfolio, orders[0])).toBe(true);
    expect(canDeleteActivity(portfolio, orders[3])).toBe(true);
  });
});

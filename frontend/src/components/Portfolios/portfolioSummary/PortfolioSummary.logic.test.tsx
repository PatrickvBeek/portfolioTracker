import { getTestOrdersGroupedByAsset, getTestPortfolio } from "pt-domain";
import { vi } from "vitest";
import {
  customRenderHook,
  customWaitFor,
} from "../../../testUtils/componentHelpers";
import { setUserData } from "../../../testUtils/localStorage";
import { mockNetwork } from "../../../testUtils/networkMock";
import {
  useCashFlow,
  useMarketValue,
  useNonRealizedGains,
  usePortfolioAge,
  useRealizedGains,
  useTimeWeightedReturn,
} from "./PortfolioSummary.logic";

vi.setSystemTime("2000-07-01");

const portfolioName = "test-portfolio";
const testPortfolio = getTestPortfolio({
  name: portfolioName,
  orders: getTestOrdersGroupedByAsset([
    {
      asset: "a1",
      timestamp: "2000-03-01",
      sharePrice: 100,
      pieces: 10,
      orderFee: 1,
      taxes: 0,
    },
    {
      asset: "a1",
      timestamp: "2000-04-01",
      sharePrice: 110,
      pieces: 10,
      orderFee: 1,
      taxes: 0,
    },
    {
      asset: "b1",
      timestamp: "2000-05-01",
      sharePrice: 200,
      pieces: 10,
      orderFee: 1,
      taxes: 0,
    },
    {
      asset: "a1",
      timestamp: "2000-05-01",
      sharePrice: 115,
      pieces: -10,
      orderFee: 1,
      taxes: 5,
    },
  ]),
});

const assetLib = {
  a1: {
    displayName: "asset a",
    isin: "a1",
    symbol: "a",
  },
  b1: {
    displayName: "asset b",
    isin: "b1",
    symbol: "b",
  },
};

setUserData({
  portfolios: { [testPortfolio.name]: testPortfolio },
  assets: assetLib,
});

describe("PortfolioSummary hooks", () => {
  describe("without online prices", () => {
    mockNetwork({ prices: {} });
    it("useCashflow", () => {
      const { result } = customRenderHook(() => useCashFlow([portfolioName]));

      expect(result.current).toEqual(
        1000 + 1 + 1100 + 1 + 2000 + 1 - 1150 + 1 + 5
      );
    });

    it("useRealizedGains", () => {
      const { result } = customRenderHook(() =>
        useRealizedGains([portfolioName])
      );

      expect(result.current).toEqual(150 - 5 - 1 - 1);
    });

    it("useNonRealizedGains", async () => {
      const { result } = customRenderHook(() =>
        useNonRealizedGains([portfolioName])
      );

      expect(result.current?.isLoading).toEqual(true);
      await customWaitFor(() => {
        expect(result.current?.isLoading).toEqual(false);
      });
      expect(result.current?.data).toEqual(50 - 1 + 0 - 1);
    });

    it("useMarketValue", async () => {
      const { result } = customRenderHook(() =>
        useMarketValue([portfolioName])
      );

      await customWaitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });
      expect(result.current?.data).toBe(1150 + 2000);
    });

    it("balance sums up", async () => {
      const cashFlow = customRenderHook(() => useCashFlow([portfolioName]));
      const realizedGains = customRenderHook(() =>
        useRealizedGains([portfolioName])
      );
      const nonRealizedGains = customRenderHook(() =>
        useNonRealizedGains([portfolioName])
      );
      const marketValue = customRenderHook(() =>
        useMarketValue([portfolioName])
      );

      await customWaitFor(() => {
        [nonRealizedGains, marketValue].every(
          (query) => query.result.current?.isLoading === false
        );
      });

      expect(
        cashFlow.result.current +
          realizedGains.result.current +
          nonRealizedGains.result.current!.data!
      ).toBe(marketValue.result.current?.data);
    });

    it("usePortfolioAge", () => {
      expect(
        customRenderHook(() => usePortfolioAge([portfolioName])).result.current
      ).toBeCloseTo(1 / 3);
    });

    it("useTimeWeightedReturn", async () => {
      const { result } = customRenderHook(() =>
        useTimeWeightedReturn([portfolioName])
      );

      await customWaitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.data).toBeCloseTo(1.145);
    });
  });

  describe("with empty portfolio array", () => {
    it("useCashFlow returns 0", () => {
      const { result } = customRenderHook(() => useCashFlow([]));
      expect(result.current).toBe(0);
    });

    it("useRealizedGains returns 0", () => {
      const { result } = customRenderHook(() => useRealizedGains([]));
      expect(result.current).toBe(0);
    });

    it("useNonRealizedGains returns 0", () => {
      const { result } = customRenderHook(() => useNonRealizedGains([]));
      expect(result.current).toEqual({
        isLoading: false,
        isError: false,
        data: 0,
      });
    });

    it("useMarketValue returns 0", () => {
      const { result } = customRenderHook(() => useMarketValue([]));
      expect(result.current).toEqual({
        isLoading: false,
        isError: false,
        data: 0,
      });
    });

    it("usePortfolioAge returns NaN", () => {
      const { result } = customRenderHook(() => usePortfolioAge([]));
      expect(result.current).toBeNaN();
    });

    it("useTimeWeightedReturn returns undefined", () => {
      const { result } = customRenderHook(() => useTimeWeightedReturn([]));
      expect(result.current).toEqual({
        isLoading: false,
        isError: false,
        data: undefined,
      });
    });
  });

  describe("with multiple portfolios", () => {
    const portfolio1Name = "portfolio-1";
    const portfolio2Name = "portfolio-2";

    const portfolio1 = getTestPortfolio({
      name: portfolio1Name,
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "a1",
          timestamp: "2000-01-01",
          sharePrice: 100,
          pieces: 10,
          orderFee: 1,
          taxes: 0,
        },
      ]),
    });

    const portfolio2 = getTestPortfolio({
      name: portfolio2Name,
      orders: getTestOrdersGroupedByAsset([
        {
          asset: "b1",
          timestamp: "2000-02-01",
          sharePrice: 200,
          pieces: 5,
          orderFee: 2,
          taxes: 0,
        },
      ]),
    });

    beforeAll(() => {
      setUserData({
        portfolios: {
          [portfolio1Name]: portfolio1,
          [portfolio2Name]: portfolio2,
        },
        assets: assetLib,
      });
    });

    mockNetwork({ prices: {} });

    it("useCashFlow sums cashflows across portfolios", () => {
      const { result: single1 } = customRenderHook(() =>
        useCashFlow([portfolio1Name])
      );
      const { result: single2 } = customRenderHook(() =>
        useCashFlow([portfolio2Name])
      );
      const { result: combined } = customRenderHook(() =>
        useCashFlow([portfolio1Name, portfolio2Name])
      );

      expect(combined.current).toBe(single1.current + single2.current);
    });

    it("useRealizedGains sums gains across portfolios", () => {
      const { result: single1 } = customRenderHook(() =>
        useRealizedGains([portfolio1Name])
      );
      const { result: single2 } = customRenderHook(() =>
        useRealizedGains([portfolio2Name])
      );
      const { result: combined } = customRenderHook(() =>
        useRealizedGains([portfolio1Name, portfolio2Name])
      );

      expect(combined.current).toBe(single1.current + single2.current);
    });

    it("useMarketValue sums market values across portfolios", async () => {
      const { result: single1 } = customRenderHook(() =>
        useMarketValue([portfolio1Name])
      );
      const { result: single2 } = customRenderHook(() =>
        useMarketValue([portfolio2Name])
      );
      const { result: combined } = customRenderHook(() =>
        useMarketValue([portfolio1Name, portfolio2Name])
      );

      await customWaitFor(() => {
        expect(combined.current?.isLoading).toBe(false);
      });

      expect(combined.current?.data).toBe(
        (single1.current?.data ?? 0) + (single2.current?.data ?? 0)
      );
    });

    it("usePortfolioAge returns earliest age", () => {
      const { result: single1 } = customRenderHook(() =>
        usePortfolioAge([portfolio1Name])
      );
      const { result: combined } = customRenderHook(() =>
        usePortfolioAge([portfolio1Name, portfolio2Name])
      );

      expect(combined.current).toBe(single1.current);
    });

    it("usePortfolioAge with reversed order still returns earliest", () => {
      const { result: combined } = customRenderHook(() =>
        usePortfolioAge([portfolio2Name, portfolio1Name])
      );
      const { result: single1 } = customRenderHook(() =>
        usePortfolioAge([portfolio1Name])
      );

      expect(combined.current).toBe(single1.current);
    });
  });

  describe("with non-existent portfolio", () => {
    it("useCashFlow ignores non-existent portfolios", () => {
      const { result } = customRenderHook(() =>
        useCashFlow([portfolioName, "non-existent"])
      );
      const { result: existing } = customRenderHook(() =>
        useCashFlow([portfolioName])
      );

      expect(result.current).toBe(existing.current);
    });

    it("useRealizedGains ignores non-existent portfolios", () => {
      const { result } = customRenderHook(() =>
        useRealizedGains([portfolioName, "non-existent"])
      );
      const { result: existing } = customRenderHook(() =>
        useRealizedGains([portfolioName])
      );

      expect(result.current).toBe(existing.current);
    });
  });
});

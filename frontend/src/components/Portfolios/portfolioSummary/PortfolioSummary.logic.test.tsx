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
      const { result } = customRenderHook(() => useCashFlow(portfolioName));

      expect(result.current).toEqual(
        1000 + 1 + 1100 + 1 + 2000 + 1 - 1150 + 1 + 5
      );
    });

    it("useRealizedGains", () => {
      const { result } = customRenderHook(() =>
        useRealizedGains(portfolioName)
      );

      expect(result.current).toEqual(150 - 5 - 1 - 1);
    });

    it("useNonRealizedGains", async () => {
      const { result } = customRenderHook(() =>
        useNonRealizedGains(portfolioName)
      );

      expect(result.current?.isLoading).toEqual(true);
      await customWaitFor(() => {
        expect(result.current?.isLoading).toEqual(false);
      });
      expect(result.current?.data).toEqual(50 - 1 + 0 - 1);
    });

    it("useMarketValue", async () => {
      const { result } = customRenderHook(() => useMarketValue(portfolioName));

      await customWaitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });
      expect(result.current?.data).toBe(1150 + 2000);
    });

    it("balance sums up", async () => {
      const cashFlow = customRenderHook(() => useCashFlow(portfolioName));
      const realizedGains = customRenderHook(() =>
        useRealizedGains(portfolioName)
      );
      const nonRealizedGains = customRenderHook(() =>
        useNonRealizedGains(portfolioName)
      );
      const marketValue = customRenderHook(() => useMarketValue(portfolioName));

      await customWaitFor(() => {
        [nonRealizedGains, marketValue].every(
          (query) => query.result.current?.isLoading === false
        );
      });

      expect(
        cashFlow.result.current! +
          realizedGains.result.current! +
          nonRealizedGains.result.current?.data!
      ).toBe(marketValue.result.current?.data);
    });

    it("usePortfolioAge", () => {
      expect(
        customRenderHook(() => usePortfolioAge(portfolioName)).result.current
      ).toBeCloseTo(1 / 3);
    });

    it("useTimeWeightedReturn", async () => {
      const { result } = customRenderHook(() =>
        useTimeWeightedReturn(portfolioName)
      );

      await customWaitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.data).toBeCloseTo(1.145);
    });
  });
});

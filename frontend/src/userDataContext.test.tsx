import {
  Asset,
  getTestDividendPayout,
  getTestOrder,
  getTestPortfolio,
} from "pt-domain";
import { act, renderHook } from "@testing-library/react";
import {
  EXPORT_VERSION,
  parseUserData,
  UserDataProvider,
  useAddAsset,
  useAddDividendPayoutToPortfolio,
  useAddOrderToPortfolio,
  useAddPortfolio,
  useDeleteAsset,
  useDeleteDividendPayoutFromPortfolio,
  useDeleteOrderFromPortfolio,
  useDeletePortfolio,
  useGetApiKeys,
  useGetAssets,
  useGetPortfolios,
  useGetUserData,
  useSetAllUserData,
  useSetApiKey,
} from "./userDataContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserDataProvider>{children}</UserDataProvider>
);

describe("UserDataContext write operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("addAsset", () => {
    it("persists the asset library to localStorage", () => {
      const asset: Asset = {
        isin: "US0000000001",
        displayName: "Test Asset",
        symbol: "TST",
      };

      const { result } = renderHook(() => useAddAsset(), { wrapper });

      act(() => {
        result.current(asset);
      });

      const stored = JSON.parse(localStorage.getItem("assets") ?? "{}");
      expect(stored[asset.isin]).toEqual(asset);
    });

    it("updates React state", () => {
      const asset: Asset = {
        isin: "US0000000001",
        displayName: "Test Asset",
        symbol: "TST",
      };

      const { result } = renderHook(
        () => ({
          addAsset: useAddAsset(),
          assets: useGetAssets(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addAsset(asset);
      });

      expect(result.current.assets[asset.isin]).toEqual(asset);
    });
  });

  describe("deleteAsset", () => {
    it("removes asset from localStorage", () => {
      const asset: Asset = {
        isin: "US0000000001",
        displayName: "Test Asset",
        symbol: "TST",
      };

      const { result } = renderHook(
        () => ({
          addAsset: useAddAsset(),
          deleteAsset: useDeleteAsset(),
          assets: useGetAssets(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addAsset(asset);
      });
      act(() => {
        result.current.deleteAsset(asset);
      });

      const stored = JSON.parse(localStorage.getItem("assets") ?? "{}");
      expect(stored[asset.isin]).toBeUndefined();
      expect(result.current.assets[asset.isin]).toBeUndefined();
    });
  });

  describe("addPortfolio", () => {
    it("persists the portfolio to localStorage", () => {
      const portfolio = getTestPortfolio({ name: "test-portfolio" });

      const { result } = renderHook(() => useAddPortfolio(), { wrapper });

      act(() => {
        result.current(portfolio);
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(stored["test-portfolio"].name).toBe("test-portfolio");
    });
  });

  describe("deletePortfolio", () => {
    it("removes portfolio from localStorage", () => {
      const portfolio = getTestPortfolio({ name: "to-delete" });

      const { result } = renderHook(
        () => ({
          addPortfolio: useAddPortfolio(),
          deletePortfolio: useDeletePortfolio(),
          portfolios: useGetPortfolios(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addPortfolio(portfolio);
      });
      act(() => {
        result.current.deletePortfolio("to-delete");
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(stored["to-delete"]).toBeUndefined();
      expect(result.current.portfolios["to-delete"]).toBeUndefined();
    });
  });

  describe("addOrderToPortfolio", () => {
    it("persists the order in the portfolio in localStorage", () => {
      const portfolio = getTestPortfolio({ name: "orders-test" });
      const order = getTestOrder({ asset: "US0000000001" });

      const { result } = renderHook(
        () => ({
          addPortfolio: useAddPortfolio(),
          addOrder: useAddOrderToPortfolio("orders-test"),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addPortfolio(portfolio);
      });
      act(() => {
        result.current.addOrder(order);
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(stored["orders-test"].orders[order.asset]).toBeDefined();
    });
  });

  describe("deleteOrderFromPortfolio", () => {
    it("removes the order from localStorage", () => {
      const portfolio = getTestPortfolio({ name: "del-order-test" });
      const order = getTestOrder({ asset: "US0000000001" });

      const { result } = renderHook(
        () => ({
          addPortfolio: useAddPortfolio(),
          addOrder: useAddOrderToPortfolio("del-order-test"),
          deleteOrder: useDeleteOrderFromPortfolio("del-order-test"),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addPortfolio(portfolio);
      });
      act(() => {
        result.current.addOrder(order);
      });
      act(() => {
        result.current.deleteOrder(order);
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(stored["del-order-test"].orders[order.asset]).toBeUndefined();
    });
  });

  describe("addDividendPayoutToPortfolio", () => {
    it("persists the dividend payout in localStorage", () => {
      const portfolio = getTestPortfolio({ name: "div-test" });
      const payout = getTestDividendPayout({ asset: "US0000000001" });

      const { result } = renderHook(
        () => ({
          addPortfolio: useAddPortfolio(),
          addDividend: useAddDividendPayoutToPortfolio("div-test"),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addPortfolio(portfolio);
      });
      act(() => {
        result.current.addDividend(payout);
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(stored["div-test"].dividendPayouts[payout.asset]).toBeDefined();
    });
  });

  describe("deleteDividendPayoutFromPortfolio", () => {
    it("removes the dividend payout from localStorage", () => {
      const portfolio = getTestPortfolio({ name: "del-div-test" });
      const payout = getTestDividendPayout({ asset: "US0000000001" });

      const { result } = renderHook(
        () => ({
          addPortfolio: useAddPortfolio(),
          addDividend: useAddDividendPayoutToPortfolio("del-div-test"),
          deleteDividend: useDeleteDividendPayoutFromPortfolio("del-div-test"),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addPortfolio(portfolio);
      });
      act(() => {
        result.current.addDividend(payout);
      });
      act(() => {
        result.current.deleteDividend(payout);
      });

      const stored = JSON.parse(localStorage.getItem("portfolios") ?? "{}");
      expect(
        stored["del-div-test"].dividendPayouts[payout.asset]
      ).toBeUndefined();
    });
  });

  describe("setApiKey", () => {
    it("persists the API key to localStorage", () => {
      const { result } = renderHook(
        () => ({
          setApiKey: useSetApiKey("yahoo"),
          apiKeys: useGetApiKeys(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.setApiKey("my-yahoo-key");
      });

      const stored = JSON.parse(localStorage.getItem("apiKeys") ?? "{}");
      expect(stored.yahoo).toBe("my-yahoo-key");
      expect(result.current.apiKeys.yahoo).toBe("my-yahoo-key");
    });
  });

  describe("getUserData / setAllUserData", () => {
    it("round-trips all user data through the import/export seam", () => {
      const asset: Asset = {
        isin: "US0000000001",
        displayName: "Test Asset",
        symbol: "TST",
      };
      const portfolio = getTestPortfolio({ name: "export-test" });

      const { result } = renderHook(
        () => ({
          addAsset: useAddAsset(),
          addPortfolio: useAddPortfolio(),
          setApiKey: useSetApiKey("yahoo"),
          getUserData: useGetUserData(),
          setAllUserData: useSetAllUserData(),
          assets: useGetAssets(),
          portfolios: useGetPortfolios(),
          apiKeys: useGetApiKeys(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.addAsset(asset);
        result.current.addPortfolio(portfolio);
        result.current.setApiKey("test-key");
      });

      const userData = result.current.getUserData();
      expect(userData.assets[asset.isin]).toEqual(asset);
      expect(userData.portfolios["export-test"]).toBeDefined();
      expect(userData.apiKeys.yahoo).toBe("test-key");
      expect(userData.meta.exportVersion).toBe(EXPORT_VERSION);

      localStorage.clear();

      const { result: result2 } = renderHook(
        () => ({
          setAllUserData: useSetAllUserData(),
          assets: useGetAssets(),
          portfolios: useGetPortfolios(),
          apiKeys: useGetApiKeys(),
        }),
        { wrapper }
      );

      act(() => {
        result2.current.setAllUserData(userData);
      });

      expect(result2.current.assets[asset.isin]).toEqual(asset);
      expect(result2.current.portfolios["export-test"]).toBeDefined();
      expect(result2.current.apiKeys.yahoo).toBe("test-key");

      const storedAssets = JSON.parse(localStorage.getItem("assets") ?? "{}");
      expect(storedAssets[asset.isin]).toEqual(asset);
    });
  });

  describe("parseUserData", () => {
    it("parses valid v2 data", () => {
      const data = {
        assets: { ISIN1: { isin: "ISIN1", displayName: "A" } },
        portfolios: { p1: { name: "p1", orders: {}, dividendPayouts: {} } },
        apiKeys: { yahoo: "key" },
        meta: { exportVersion: 2 },
      };

      const result = parseUserData(JSON.stringify(data));
      expect(result.meta.exportVersion).toBe(2);
      expect(result.apiKeys.yahoo).toBe("key");
    });

    it("migrates v1 data to v2", () => {
      const data = {
        assets: {},
        portfolios: {},
        meta: { exportVersion: 1 },
      };

      const result = parseUserData(JSON.stringify(data));
      expect(result.meta.exportVersion).toBe(2);
      expect(result.apiKeys.yahoo).toBe("");
    });

    it("throws on invalid data", () => {
      expect(() => parseUserData("{}")).toThrow("cannot parse user data");
    });
  });
});

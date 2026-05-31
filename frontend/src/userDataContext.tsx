import {
  addAssetToLibrary,
  addDividendPayoutToPortfolio,
  addOrderToPortfolio,
  addPortfolioToLibrary,
  Asset,
  AssetLibrary,
  deleteAssetFromLib,
  deleteDividendPayoutFromPortfolio,
  deleteOrderFromPortfolio,
  deletePortfolioFromLibrary,
  DividendPayout,
  EMPTY_PORTFOLIO,
  getActivitiesForPortfolio,
  Order,
  Portfolio,
  PortfolioLibrary,
} from "pt-domain";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { isNotNil } from "./utility/types";

export const EXPORT_VERSION = 2;

export type ApiKeys = {
  yahoo: string;
};

export type UserData = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  apiKeys: ApiKeys;
  meta: {
    exportVersion: typeof EXPORT_VERSION;
  };
};

export const parseUserData = (jsonString: string): UserData => {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion JSON.parse returns any, validation done below
  const parsedObject = JSON.parse(jsonString) as UserDataOfAnyVersion;
  if (!(parsedObject.assets && parsedObject.meta && parsedObject.portfolios)) {
    throw new Error(`cannot parse user data ${jsonString}`);
  }

  return doMigration(parsedObject);
};

const doMigration = (data: UserDataOfAnyVersion): UserData => {
  if (data.meta.exportVersion === 1) {
    return getV2(data);
  }
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion runtime check ensures correct version
  return data as UserData;
};

type UserDataOfAnyVersion = UserData | UserDataV1;

const getV2 = (userData: UserDataOfAnyVersion): UserData => ({
  ...userData,
  apiKeys: { yahoo: "" },
  meta: {
    exportVersion: 2,
  },
});

type UserDataV1 = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  meta: {
    exportVersion: 1;
  };
};

const UserDataContext = createContext<{
  assets: AssetLibrary;
  portfolios: PortfolioLibrary;
  apiKeys: ApiKeys;
  addAsset: (asset: Asset) => void;
  deleteAsset: (asset: Asset) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  deletePortfolio: (portfolioName: string) => void;
  addOrderToPortfolio: (portfolioName: string, order: Order) => void;
  deleteOrderFromPortfolio: (portfolioName: string, order: Order) => void;
  addDividendPayoutToPortfolio: (
    portfolioName: string,
    payout: DividendPayout
  ) => void;
  deleteDividendPayoutFromPortfolio: (
    portfolioName: string,
    payout: DividendPayout
  ) => void;
  setApiKey: (keyType: keyof ApiKeys, value: string) => void;
  setAllUserData: (userData: UserData) => void;
  getUserData: () => UserData;
}>({
  assets: {},
  portfolios: {},
  apiKeys: { yahoo: "" },
  addAsset: () => {},
  deleteAsset: () => {},
  addPortfolio: () => {},
  deletePortfolio: () => {},
  addOrderToPortfolio: () => {},
  deleteOrderFromPortfolio: () => {},
  addDividendPayoutToPortfolio: () => {},
  deleteDividendPayoutFromPortfolio: () => {},
  setApiKey: () => {},
  setAllUserData: () => {},
  getUserData: () => ({
    assets: {},
    portfolios: {},
    apiKeys: { yahoo: "" },
    meta: { exportVersion: EXPORT_VERSION },
  }),
});

export const UserDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [assets, setAssets] = useState<AssetLibrary>(
    readAssetsFromLocalStorage
  );
  const [portfolios, setPortfolios] = useState<PortfolioLibrary>(
    readPortfoliosFromLocalStorage
  );
  const [apiKeys, setApiKeys] = useState<ApiKeys>(readApiKeysFromLocalStorage);

  const persistAssets = (lib: AssetLibrary) => {
    setAssets(lib);
    localStorage.setItem("assets", JSON.stringify(lib));
  };

  const persistPortfolios = (lib: PortfolioLibrary) => {
    setPortfolios(lib);
    localStorage.setItem("portfolios", JSON.stringify(lib));
  };

  const persistApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem("apiKeys", JSON.stringify(keys));
  };

  const addAsset = (asset: Asset) => {
    persistAssets(addAssetToLibrary(assets, asset));
  };

  const deleteAsset = (asset: Asset) => {
    persistAssets(deleteAssetFromLib(assets, asset));
  };

  const addPortfolio = (portfolio: Portfolio) => {
    persistPortfolios(addPortfolioToLibrary(portfolios, portfolio));
  };

  const deletePortfolio = (portfolioName: string) => {
    persistPortfolios(deletePortfolioFromLibrary(portfolios, portfolioName));
  };

  const addOrderToPortfolioAction = (portfolioName: string, order: Order) => {
    const portfolio = portfolios[portfolioName];
    const updated = addOrderToPortfolio(portfolio, order);
    persistPortfolios(addPortfolioToLibrary(portfolios, updated));
  };

  const deleteOrderFromPortfolioAction = (
    portfolioName: string,
    order: Order
  ) => {
    const portfolio = portfolios[portfolioName];
    const updated = deleteOrderFromPortfolio(portfolio, order);
    persistPortfolios(addPortfolioToLibrary(portfolios, updated));
  };

  const addDividendPayoutToPortfolioAction = (
    portfolioName: string,
    payout: DividendPayout
  ) => {
    const portfolio = portfolios[portfolioName];
    const updated = addDividendPayoutToPortfolio(portfolio, payout);
    persistPortfolios(addPortfolioToLibrary(portfolios, updated));
  };

  const deleteDividendPayoutFromPortfolioAction = (
    portfolioName: string,
    payout: DividendPayout
  ) => {
    const portfolio = portfolios[portfolioName];
    const updated = deleteDividendPayoutFromPortfolio(portfolio, payout);
    persistPortfolios(addPortfolioToLibrary(portfolios, updated));
  };

  const setApiKey = (keyType: keyof ApiKeys, value: string) => {
    persistApiKeys({ ...apiKeys, [keyType]: value });
  };

  const setAllUserData = (userData: UserData) => {
    persistAssets(userData.assets);
    persistPortfolios(userData.portfolios);
    persistApiKeys(userData.apiKeys);
  };

  const getUserData = (): UserData => ({
    assets,
    portfolios,
    apiKeys,
    meta: { exportVersion: EXPORT_VERSION },
  });

  return (
    <UserDataContext.Provider
      value={{
        assets,
        portfolios,
        apiKeys,
        addAsset,
        deleteAsset,
        addPortfolio,
        deletePortfolio,
        addOrderToPortfolio: addOrderToPortfolioAction,
        deleteOrderFromPortfolio: deleteOrderFromPortfolioAction,
        addDividendPayoutToPortfolio: addDividendPayoutToPortfolioAction,
        deleteDividendPayoutFromPortfolio:
          deleteDividendPayoutFromPortfolioAction,
        setApiKey,
        setAllUserData,
        getUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

function readAssetsFromLocalStorage(): AssetLibrary {
  const savedAssets = localStorage.getItem("assets");
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion localStorage is trusted source
  return savedAssets ? (JSON.parse(savedAssets) as AssetLibrary) : {};
}

function readPortfoliosFromLocalStorage(): PortfolioLibrary {
  const savedPortfolios = localStorage.getItem("portfolios");
  return savedPortfolios
    ? // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion localStorage is trusted source
      (JSON.parse(savedPortfolios) as PortfolioLibrary)
    : {};
}

function readApiKeysFromLocalStorage(): ApiKeys {
  const savedApiKeys = localStorage.getItem("apiKeys");
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion localStorage is trusted source
  return savedApiKeys ? (JSON.parse(savedApiKeys) as ApiKeys) : { yahoo: "" };
}

export function useGetAssets(): AssetLibrary {
  const { assets } = useContext(UserDataContext);
  return assets;
}

export function useAddAsset() {
  const { addAsset } = useContext(UserDataContext);
  return addAsset;
}

export function useDeleteAsset() {
  const { deleteAsset } = useContext(UserDataContext);
  return deleteAsset;
}

export const useSymbol = (isin: string) => useGetAssets()?.[isin]?.symbol ?? "";

export function useGetPortfolios() {
  const { portfolios } = useContext(UserDataContext);
  return portfolios;
}

export function useAddPortfolio() {
  const { addPortfolio } = useContext(UserDataContext);
  return addPortfolio;
}

export function useDeletePortfolio() {
  const { deletePortfolio } = useContext(UserDataContext);
  return deletePortfolio;
}

export function useAddOrderToPortfolio(portfolioName: string) {
  const { addOrderToPortfolio } = useContext(UserDataContext);
  return (order: Order) => addOrderToPortfolio(portfolioName, order);
}

export function useDeleteOrderFromPortfolio(portfolioName: string) {
  const { deleteOrderFromPortfolio } = useContext(UserDataContext);
  return (order: Order) => deleteOrderFromPortfolio(portfolioName, order);
}

export function useAddDividendPayoutToPortfolio(portfolioName: string) {
  const { addDividendPayoutToPortfolio } = useContext(UserDataContext);
  return (payout: DividendPayout) =>
    addDividendPayoutToPortfolio(portfolioName, payout);
}

export function useDeleteDividendPayoutFromPortfolio(portfolioName: string) {
  const { deleteDividendPayoutFromPortfolio } = useContext(UserDataContext);
  return (payout: DividendPayout) =>
    deleteDividendPayoutFromPortfolio(portfolioName, payout);
}

export function useGetApiKeys(): ApiKeys {
  const { apiKeys } = useContext(UserDataContext);
  return apiKeys;
}

export function useSetApiKey(keyType: keyof ApiKeys) {
  const { setApiKey } = useContext(UserDataContext);
  return (value: string) => setApiKey(keyType, value);
}

export function useSetAllUserData() {
  const { setAllUserData } = useContext(UserDataContext);
  return setAllUserData;
}

export function useGetUserData() {
  const { getUserData } = useContext(UserDataContext);
  return getUserData;
}

export function useGetPortfolio(name: string): Portfolio {
  const portfolios = useGetPortfolios();
  return portfolios[name] ?? EMPTY_PORTFOLIO;
}

export function useGetPortfoliosByNames(names: string[]): Portfolio[] {
  const portfolios = useGetPortfolios();
  return names.map((name) => portfolios[name]).filter(isNotNil);
}

export const usePortfolioSelector = <T,>(
  portfolioName: string,
  selector: (p: Portfolio) => T
): T | undefined => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio && selector(portfolio);
};

export function useGetPortfolioActivity(portfolioName: string) {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio ? getActivitiesForPortfolio(portfolio) : [];
}

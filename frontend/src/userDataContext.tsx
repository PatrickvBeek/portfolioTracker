import { AssetLibrary } from "pt-domain/src/asset/asset.entities";
import { PortfolioLibrary } from "pt-domain/src/portfolio/portfolio.entities";
import { createContext, FC, PropsWithChildren, useState } from "react";
import { ApiKeys } from "./components/header/userData/userData";

export const UserDataContext = createContext<{
  assets: AssetLibrary;
  setAssets: (a: AssetLibrary) => void;
  portfolios: PortfolioLibrary;
  setPortfolios: (p: PortfolioLibrary) => void;
  apiKeys: ApiKeys;
  setApiKeys: (a: ApiKeys) => void;
}>({
  assets: {},
  setAssets: () => {},
  portfolios: {},
  setPortfolios: () => {},
  apiKeys: { yahoo: "" },
  setApiKeys: () => {},
});

export const UserDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [assets, setAssets] = useState<AssetLibrary>(
    readAssetsFromLocalStorage
  );
  const [portfolios, setPortfolios] = useState<PortfolioLibrary>(
    readPortfoliosFromLocalStorage
  );
  const [apiKeys, setApiKeys] = useState<ApiKeys>(readApiKeysFromLocalStorage);

  return (
    <UserDataContext.Provider
      value={{
        assets,
        setAssets,
        portfolios,
        setPortfolios,
        apiKeys,
        setApiKeys,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

function readAssetsFromLocalStorage(): AssetLibrary {
  const savedAssets = localStorage.getItem("assets");
  return savedAssets ? (JSON.parse(savedAssets) as AssetLibrary) : {};
}

function readPortfoliosFromLocalStorage(): PortfolioLibrary {
  const savedPortfolios = localStorage.getItem("portfolios");
  return savedPortfolios
    ? (JSON.parse(savedPortfolios) as PortfolioLibrary)
    : {};
}

function readApiKeysFromLocalStorage(): ApiKeys {
  const savedApiKeys = localStorage.getItem("apiKeys");
  return savedApiKeys ? (JSON.parse(savedApiKeys) as ApiKeys) : { yahoo: "" };
}

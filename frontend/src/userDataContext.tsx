import { createContext, FC, PropsWithChildren, useState } from "react";
import { AssetLibrary } from "../../domain/src/asset/asset.entities";
import { PortfolioLibrary } from "../../domain/src/portfolio/portfolio.entities";

export const UserDataContext = createContext<{
  assets: AssetLibrary;
  setAssets: (a: AssetLibrary) => void;
  portfolios: PortfolioLibrary;
  setPortfolios: (p: PortfolioLibrary) => void;
}>({
  assets: {},
  setAssets: () => {},
  portfolios: {},
  setPortfolios: () => {},
});

export const UserDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [assets, setAssets] = useState<AssetLibrary>(
    readAssetsFromLocalStorage
  );
  const [portfolios, setPortfolios] = useState<PortfolioLibrary>(
    readPortfoliosFromLocalStorage
  );

  return (
    <UserDataContext.Provider
      value={{
        assets,
        setAssets,
        portfolios,
        setPortfolios,
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

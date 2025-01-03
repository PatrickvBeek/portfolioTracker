import { createContext, useState } from "react";
import { AssetLibrary } from "../../domain/src/asset/asset.entities";

export const useUserDataContext = () => {
  const [assets, setAssets] = useState<AssetLibrary>(
    readAssetsFromLocalStorage
  );
  const UserDataContext = createContext<{
    assets: AssetLibrary;
    setAssets: (a: AssetLibrary) => void;
  }>({
    assets,
    setAssets,
  });

  return { UserDataContext, assets, setAssets };
};

function readAssetsFromLocalStorage(): AssetLibrary {
  const savedAssets = localStorage.getItem("assets");
  return savedAssets ? (JSON.parse(savedAssets) as AssetLibrary) : {};
}

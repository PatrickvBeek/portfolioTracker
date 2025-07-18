import {
  addAssetToLibrary,
  Asset,
  AssetLibrary,
  deleteAssetFromLib,
} from "pt-domain";
import { useContext } from "react";
import { UserDataContext } from "../../userDataContext";

export function useGetAssets(): AssetLibrary | undefined {
  const { assets } = useContext(UserDataContext);
  return assets;
}

export function useSetAssets() {
  const { setAssets } = useContext(UserDataContext);

  return (assets: AssetLibrary) => {
    setAssets(assets);
    localStorage.setItem("assets", JSON.stringify(assets));
  };
}

export function useUpdateAssets(
  updater: (assetLib: AssetLibrary, updateData: Asset) => AssetLibrary
) {
  const { setAssets, assets } = useContext(UserDataContext);
  return (asset: Asset) => {
    const newLib = updater(assets, asset);
    setAssets(newLib);
    localStorage.setItem("assets", JSON.stringify(newLib));
  };
}

export function useAddAsset() {
  return useUpdateAssets(addAssetToLibrary);
}

export function useDeleteAsset() {
  return useUpdateAssets(deleteAssetFromLib);
}

export const useSymbol = (isin: string) => useGetAssets()?.[isin]?.symbol ?? "";

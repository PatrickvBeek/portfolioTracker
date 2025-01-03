import {
  Asset,
  AssetLibrary,
} from "../../../../domain/src/asset/asset.entities";
import {
  addAssetToLibrary,
  deleteAssetFromLib,
} from "../../../../domain/src/asset/asset.operations";
import { useUserDataContext } from "../../userDataContext";

export function useGetAssets(): AssetLibrary | undefined {
  const { assets } = useUserDataContext();
  return assets;
}

export function useSetAssets() {
  const { setAssets } = useUserDataContext();

  return (assets: AssetLibrary) => {
    setAssets(assets);
    localStorage.setItem("assets", JSON.stringify(assets));
  };
}

export function useUpdateAssets(
  updater: (assetLib: AssetLibrary, updateData: Asset) => AssetLibrary
) {
  const { setAssets, assets } = useUserDataContext();
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

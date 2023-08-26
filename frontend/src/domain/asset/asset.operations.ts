import { omit } from "radash";
import { Asset, AssetLibrary } from "./asset.entities";

export const deleteAssetFromLib: (
  lib: AssetLibrary,
  asset: Asset
) => AssetLibrary = (lib, asset) => (lib ? omit(lib, [asset.isin]) : {});

export function addAssetToLibrary(
  lib: AssetLibrary,
  asset: Asset
): AssetLibrary {
  return {
    ...lib,
    [asset.isin]: asset,
  };
}

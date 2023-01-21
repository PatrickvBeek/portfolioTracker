import { Asset, AssetLibrary } from "../types";

export const deleteAssetFromLib: (
  lib: AssetLibrary,
  asset: Asset
) => AssetLibrary = (lib, asset) =>
  lib
    ? Object.keys(lib)
        .filter((isin) => isin !== asset.isin)
        .reduce(
          (assets, isin) => Object.assign(assets, { [isin]: lib[isin] }),
          {}
        )
    : {};

export function addAssetToLibrary(
  lib: AssetLibrary,
  asset: Asset
): AssetLibrary {
  return {
    ...lib,
    [asset.isin]: asset,
  };
}

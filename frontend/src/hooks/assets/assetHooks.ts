import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Asset,
  AssetLibrary,
} from "../../../../domain/src/asset/asset.entities";
import {
  addAssetToLibrary,
  deleteAssetFromLib,
} from "../../../../domain/src/asset/asset.operations";

export function useGetAssets() {
  return useQuery("assets", fetchAssets);
}

export function useSetAssets() {
  const client = useQueryClient();
  return useMutation(saveAssetsOnServer, {
    onSuccess: () => {
      client.invalidateQueries("assets");
    },
  });
}

export function useUpdateAssets(
  updater: (assetLib: AssetLibrary, updateData: Asset) => AssetLibrary
) {
  const queryClient = useQueryClient();
  const previousLib =
    queryClient.getQueryData<Record<string, Asset>>("assets") || {};
  return useMutation(
    (asset: Asset) => {
      return saveAssetsOnServer(updater(previousLib, asset));
    },
    {
      onSuccess: (_, asset) => {
        queryClient.invalidateQueries("assets");
        queryClient.setQueriesData("assets", updater(previousLib, asset));
      },
    }
  );
}

export function useAddAsset() {
  return useUpdateAssets(addAssetToLibrary);
}

export function useDeleteAsset() {
  return useUpdateAssets(deleteAssetFromLib);
}

const fetchAssets = async (): Promise<Record<string, Asset>> => {
  const response = await fetch("/api/assets");
  return response.json();
};

const saveAssetsOnServer = async (assetLib: Record<string, Asset>) => {
  return fetch("/api/assets", {
    method: "PUT",
    body: JSON.stringify(assetLib),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

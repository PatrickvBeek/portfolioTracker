import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { Asset } from "../../data/types";

interface DataProps {
  children: React.ReactNode;
}

interface dataContextFields {
  assetLibrary: Record<string, Asset>;
  addAsset: (asset: Asset) => void;
  deleteAsset: (asset: Asset) => void;
}

const defaultState: dataContextFields = {
  assetLibrary: {} as Record<string, Asset>,
  addAsset: (asset: Asset) => {},
  deleteAsset: (asset: Asset) => {},
};

const requestAssets = async () => {
  const response = await fetch("/assets/get-assets");
  return await response.json();
};

const postAsset = async (asset: Asset) => {
  await fetch("/assets/add-asset", {
    method: "POST",
    body: JSON.stringify(asset),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const deleteAssetFromServer = async (asset: Asset) => {
  await fetch("/assets/delete-asset", {
    method: "PUT",
    body: JSON.stringify(asset),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const DataContext = createContext<dataContextFields>(defaultState);

const Data: FunctionComponent<DataProps> = ({ children }) => {
  const [assetLibrary, setAssetLibrary] = useState(defaultState.assetLibrary);

  useEffect(() => {
    async function fetchAssets() {
      setAssetLibrary(await requestAssets());
    }
    fetchAssets();
  }, []);

  const addAsset = (asset: Asset): void => {
    postAsset(asset);
    setAssetLibrary({
      ...assetLibrary,
      [asset.isin]: asset,
    });
  };

  const deleteAsset = (asset: Asset): void => {
    deleteAssetFromServer(asset);
    setAssetLibrary(
      Object.keys(assetLibrary)
        .filter((isin) => isin !== asset.isin)
        .reduce(
          (assets, isin) =>
            Object.assign(assets, { [isin]: assetLibrary[isin] }),
          {}
        )
    );
  };

  return (
    <DataContext.Provider value={{ assetLibrary, addAsset, deleteAsset }}>
      {children}
    </DataContext.Provider>
  );
};

export default Data;

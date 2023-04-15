import { ReactElement } from "react";
import { Asset } from "../../../domain/types";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import Table, { TableRow } from "../../general/Table";
import "./AssetTable.css";

const DeleteButton = (onClick: () => void): ReactElement => {
  return <i className={"fa fa-trash-can"} onClick={onClick}></i>;
};

const mapAssetLibraryToTableData = (
  assets: Record<string, Asset>,
  deleteAsset: (asset: Asset) => void
): TableRow[] =>
  Object.values(assets).map((asset) => [
    asset.displayName,
    asset.isin,
    asset.wkn ?? "",
    DeleteButton(() => {
      window.confirm(
        `Do you really want to delete the asset "${asset.displayName}" from the asset library?`
      ) && deleteAsset(asset);
    }),
  ]);

const AssetTable = () => {
  const assetDeletion = useDeleteAsset();
  const { data, isLoading, isError, isRefetching, isSuccess } = useGetAssets();

  if (isLoading || isRefetching) {
    return <div>is loading...</div>;
  }

  if (isError) {
    return <div>an error occurred while loading...</div>;
  }

  if (!isSuccess) {
    return null;
  }

  const tableData = mapAssetLibraryToTableData(data, assetDeletion.mutate);
  if (tableData.length === 0) {
    return <div>no assets</div>;
  }

  return (
    <div className="asset-table-container">
      <Table headers={["Name", "ISIN", "WKN", "Actions"]} data={tableData} />
      <span className="asset-table-footer">{`Total: ${tableData.length} Assets`}</span>
    </div>
  );
};

export default AssetTable;

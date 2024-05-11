import { Asset } from "../../../../../domain/src/asset/asset.entities";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import CustomTable, { ColDef } from "../../general/CustomTable/CustomTable";
import DeleteButtonWithConfirmation from "../../general/DeleteButtonWithConfirm/DeleteButtonWithConfirmation";
import "./AssetTable.css";
import { SymbolConnectionIndicator } from "./SymbolConnectionIndicator";

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
    return <div>Sorry, something unexpected happened.</div>;
  }

  const customTableData = Object.values(data);
  if (customTableData.length === 0) {
    return <div>no assets</div>;
  }

  const defs: ColDef<Asset>[] = [
    { header: "Name", valueGetter: (a) => a.displayName },
    { header: "ISIN", valueGetter: (a) => a.isin },
    {
      header: "Symbol",
      valueGetter: (a) =>
        a.symbol ? <SymbolConnectionIndicator symbol={a.symbol} /> : null,
    },
    {
      header: "Actions",
      valueGetter: (a) => (
        <DeleteButtonWithConfirmation
          deleteHandler={() => assetDeletion.mutate(a)}
          body={`Do you really want to delete the asset '${a.displayName}' from your library?`}
          title={`Delete Asset '${a.displayName}'?`}
        />
      ),
    },
  ];

  return (
    <div className="asset-table-container">
      <CustomTable columDefs={defs} rows={customTableData} />
      <span className="asset-table-footer">{`Total: ${customTableData.length} Assets`}</span>
    </div>
  );
};

export default AssetTable;

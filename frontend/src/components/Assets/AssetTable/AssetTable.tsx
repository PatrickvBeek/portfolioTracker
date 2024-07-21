import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Asset } from "../../../../../domain/src/asset/asset.entities";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import CustomTable from "../../general/CustomTable/CustomTable";
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

  const columnHelper = createColumnHelper<Asset>();

  const defs: ColumnDef<Asset, any>[] = [
    columnHelper.accessor("displayName", { header: "Name" }),
    columnHelper.accessor("isin", { header: "ISIN" }),
    columnHelper.accessor("symbol", {
      header: "Symbol",
      cell: (s) =>
        s.getValue() ? (
          <SymbolConnectionIndicator symbol={s.getValue()} />
        ) : null,
    }),
    columnHelper.accessor((a) => a, {
      header: "Actions",
      cell: (a) => (
        <DeleteButtonWithConfirmation
          deleteHandler={() => assetDeletion.mutate(a.getValue())}
          body={`Do you really want to delete the asset '${a.getValue().displayName}' from your library?`}
          title={`Delete Asset '${a.getValue().displayName}'?`}
        />
      ),
    }),
  ];

  return (
    <div className="asset-table-container">
      <CustomTable columns={defs} data={customTableData} />
      <span className="asset-table-footer">{`Total: ${customTableData.length} Assets`}</span>
    </div>
  );
};

export default AssetTable;

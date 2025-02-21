import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Asset } from "pt-domain/src/asset/asset.entities";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import CustomTable from "../../general/CustomTable/CustomTable";
import DeleteButtonWithConfirmation from "../../general/DeleteButtonWithConfirm/DeleteButtonWithConfirmation";
import "./AssetTable.css";
import { SymbolConnectionIndicator } from "./SymbolConnectionIndicator";

const AssetTable = () => {
  const deleteAsset = useDeleteAsset();
  const assetLibrary = useGetAssets();

  if (!assetLibrary) {
    return null;
  }

  const customTableData = Object.values(assetLibrary);
  if (customTableData.length === 0) {
    return <div>no assets</div>;
  }

  const columnHelper = createColumnHelper<Asset>();

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          deleteHandler={() => deleteAsset(a.getValue())}
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

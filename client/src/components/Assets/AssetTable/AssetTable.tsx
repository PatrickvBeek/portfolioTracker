import { ReactElement, useState } from "react";
import { Asset } from "../../../domain/asset/asset.entities";
import { useDeleteAsset, useGetAssets } from "../../../hooks/assets/assetHooks";
import Confirmation from "../../general/Confirmation/Confirmation";
import CustomTable, { ColDef } from "../../general/CustomTable/CustomTable";
import "./AssetTable.css";

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
    return <div>Sorry, somthing unexpected happened.</div>;
  }

  const customTableData = Object.values(data);
  if (customTableData.length === 0) {
    return <div>no assets</div>;
  }

  const defs: ColDef<Asset>[] = [
    { header: "Name", valueGetter: (a) => a.displayName },
    { header: "ISIN", valueGetter: (a) => a.isin },
    { header: "WKN", valueGetter: (a) => a.wkn },
    {
      header: "Actions",
      valueGetter: (a) => (
        <DeleteAssetButton
          asset={a}
          deleteHandler={() => assetDeletion.mutate(a)}
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

type DeleteAssetButtonProps = {
  asset: Asset;
  deleteHandler: () => void;
};

function DeleteAssetButton({
  asset,
  deleteHandler,
}: DeleteAssetButtonProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <i
        className={"fa fa-trash-can delete-button"}
        onClick={() => setIsOpen(true)}
      ></i>
      {isOpen && (
        <Confirmation
          title={`Delete asset ${asset.displayName}?`}
          body={`Do you really want to delete the asset ${asset.displayName} from you library?`}
          confirmLabel={"Delete"}
          cancelLabel={"Cancel"}
          onConfirm={() => {
            deleteHandler();
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default AssetTable;

import { useCallback, useEffect, useState } from "react";
import { Asset } from "../../../data/types";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import Dropdown, { DropdownProps } from "../../general/Dropdown/Dropdown";

const { bemBlock } = bemHelper("asset-dropdown");

export type AssetDropdownProps = Pick<
  DropdownProps,
  "isValid" | "errorMessage" | "isMandatory"
> &
  Props<{
    onSelect: (isin: string) => void;
  }>;

const AssetDropdown = ({
  onSelect,
  className,
  isMandatory,
}: AssetDropdownProps) => {
  const [selected, setSelectedOption] = useState("");
  const handleSelection = useCallback(
    (isin: string) => {
      setSelectedOption(isin);
      onSelect(isin);
    },
    [onSelect]
  );
  const assetsData = useGetAssets();

  useEffect(() => {
    const isins = Object.keys(assetsData.data || {});
    isins.length > 0 && handleSelection(isins[0]);
  }, [assetsData.data, handleSelection]);

  if (assetsData.isError) {
    return <span>error loading...</span>;
  }
  if (assetsData.isFetching) {
    return <span>loading...</span>;
  }

  const assets: Record<string, Asset> = assetsData.data || {};

  return (
    <div className={bemBlock(className)}>
      <Dropdown
        label="Asset"
        onSelect={handleSelection}
        options={Object.values(assets).map((asset) => ({
          id: asset.isin,
          optionName: asset.displayName,
        }))}
        selected={selected}
        isMandatory={isMandatory}
      />
    </div>
  );
};

export default AssetDropdown;

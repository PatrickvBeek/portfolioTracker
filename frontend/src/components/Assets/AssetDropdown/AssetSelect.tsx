import styled from "@emotion/styled";
import { Autocomplete, TextField } from "@mui/material";
import { Asset } from "pt-domain";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { DropdownProps } from "../../general/Dropdown/Dropdown";
import "./AssetSelect.css";

const { bemBlock, bemElement } = bemHelper("asset-select");

const StyledOptionItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export type AssetDropdownProps = Pick<
  DropdownProps,
  "isValid" | "errorMessage" | "isMandatory"
> &
  Props<{
    onChange: (isin: string | undefined) => void;
    filterAssets?: (asset: Asset) => boolean;
    label?: string;
  }>;

const AssetDropdown = ({
  onChange,
  label,
  filterAssets,
  className,
}: AssetDropdownProps) => {
  const assetLib = useGetAssets();

  const assetsMap: Record<string, Asset> = assetLib || {};
  const assets = Object.values(assetsMap);

  return (
    <Autocomplete
      className={bemBlock(className)}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" label={label || "Asset"} />
      )}
      options={filterAssets ? assets.filter(filterAssets) : assets}
      onChange={(_, value) => onChange(value?.isin)}
      getOptionLabel={(asset) => `${asset.displayName} (${asset.isin})`}
      renderOption={(props, asset) => {
        const { key, ...restProps } = props;
        return (
          <StyledOptionItem key={key} {...restProps}>
            <div className={bemElement("option-main-text")}>
              {asset.displayName}
            </div>
            <div className={bemElement("option-fine-print")}>
              {`ISIN: ${asset.isin}`}
            </div>
            {asset.symbol ? (
              <div
                className={bemElement("option-fine-print")}
              >{`Symbol: ${asset.symbol}`}</div>
            ) : null}
          </StyledOptionItem>
        );
      }}
    />
  );
};

export default AssetDropdown;

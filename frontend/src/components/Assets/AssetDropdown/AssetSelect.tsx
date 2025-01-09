import { Autocomplete, Box, TextField } from "@mui/material";
import { Asset } from "pt-domain/src/asset/asset.entities";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { DropdownProps } from "../../general/Dropdown/Dropdown";
import "./AssetSelect.css";

const { bemBlock, bemElement } = bemHelper("asset-select");

export type AssetDropdownProps = Pick<
  DropdownProps,
  "isValid" | "errorMessage" | "isMandatory"
> &
  Props<{
    onSelect: (isin: string) => void;
  }>;

const AssetDropdown = ({ onSelect, className }: AssetDropdownProps) => {
  const assetLib = useGetAssets();

  const assetsMap: Record<string, Asset> = assetLib || {};
  const assets = Object.values(assetsMap);

  return (
    <Autocomplete
      className={bemBlock(className)}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" label="Asset" />
      )}
      options={assets}
      onChange={(_, value) => value?.isin && onSelect(value?.isin)}
      getOptionLabel={(asset) => `${asset.displayName} (${asset.isin})`}
      renderOption={(props, asset) => {
        const { key, ...restProps } = props;
        return (
          <Box
            component={"li"}
            key={key}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
            {...restProps}
          >
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
          </Box>
        );
      }}
    />
  );
};

export default AssetDropdown;

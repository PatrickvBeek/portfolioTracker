import { Autocomplete, Box, TextField } from "@mui/material";
import { Asset } from "../../../data/types";
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
  const assetsData = useGetAssets();

  if (assetsData.isError) {
    return <span>error loading...</span>;
  }
  if (assetsData.isFetching) {
    return <span>loading...</span>;
  }

  const assetsMap: Record<string, Asset> = assetsData.data || {};
  const assets = Object.values(assetsMap);

  return (
    <Autocomplete
      className={bemBlock(className)}
      renderInput={(params) => (
        <TextField {...params} variant="standard" label="Asset" />
      )}
      options={assets}
      onChange={(event, value) => value?.isin && onSelect(value?.isin)}
      getOptionLabel={(asset) =>
        `${asset.displayName}${asset.isin}${asset.wkn || ""}`
      }
      renderOption={(props, asset) => (
        <Box
          component={"li"}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
          {...props}
        >
          <div className={bemElement("option-main-text")}>
            {asset.displayName}
          </div>
          <div className={bemElement("option-fine-print")}>
            {`ISIN: ${asset.isin}`}
          </div>
          {asset.wkn ? (
            <div
              className={bemElement("option-fine-print")}
            >{`WKN: ${asset.wkn}`}</div>
          ) : null}
        </Box>
      )}
    />
  );
};

export default AssetDropdown;

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Asset } from "pt-domain";
import { useState, useId } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import { cn } from "../../../utility/cn";
import { Props } from "../../../utility/types";
import { InputProps } from "../../general/types";
import {
  assetDropdownTriggerVariants,
  styles,
  triggerLayout,
} from "./AssetSelect.styles";

type AssetDropdownProps = Pick<
  InputProps,
  "isValid" | "errorMessage" | "isMandatory"
> &
  Props<{
    onChange: (isin: string | undefined) => void;
    filterAssets?: (asset: Asset) => boolean;
    label?: string;
    placeholder?: string;
  }>;

const AssetDropdown = ({
  onChange,
  label,
  placeholder = "Asset",
  filterAssets,
  isValid,
  errorMessage,
  isMandatory,
  className,
}: AssetDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(
    undefined
  );
  const assetLib = useGetAssets();
  const selectId = useId();
  const errorId = errorMessage ? `${selectId}-error` : undefined;

  const hasError = isValid === false && !!errorMessage;
  const state = hasError ? "error" : "default";

  const assetsMap: Record<string, Asset> = assetLib || {};
  const assets = Object.values(assetsMap);
  const filteredAssets = filterAssets ? assets.filter(filterAssets) : assets;

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    onChange(asset.isin);
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id={selectId}
            role="combobox"
            aria-expanded={open}
            aria-label={label || placeholder}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId || undefined}
            className={cn(
              triggerLayout,
              assetDropdownTriggerVariants({ state, mandatory: !!isMandatory })
            )}
          >
            {selectedAsset ? selectedAsset.displayName : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-text-muted" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={styles.popoverContent}
            sideOffset={4}
            align="start"
          >
            <Command className={styles.commandRoot}>
              <Command.Input
                className={styles.commandInput}
                placeholder="Search assets..."
                autoFocus
              />
              <Command.List className={styles.commandList}>
                <Command.Empty className={styles.commandEmpty}>
                  No asset found.
                </Command.Empty>
                <Command.Group>
                  {filteredAssets.map((asset) => (
                    <Command.Item
                      key={asset.isin}
                      value={`${asset.displayName} ${asset.isin} ${asset.symbol ?? ""}`}
                      onSelect={() => handleSelect(asset)}
                      className={cn(
                        styles.commandItem,
                        selectedAsset?.isin === asset.isin && "bg-accent-soft"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className={styles.optionMainText}>
                            {asset.displayName}
                          </span>
                          <span className={styles.optionFinePrint}>
                            {`ISIN: ${asset.isin}`}
                          </span>
                          {asset.symbol ? (
                            <span className={styles.optionFinePrint}>
                              {`Symbol: ${asset.symbol}`}
                            </span>
                          ) : null}
                        </div>
                        {selectedAsset?.isin === asset.isin && (
                          <Check className="h-4 w-4 text-accent shrink-0" />
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {hasError && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default AssetDropdown;

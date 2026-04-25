import { useState } from "react";
import { useAddAsset } from "../../../hooks/assets/assetHooks";
import { cn } from "../../../utility/cn";
import { SymbolConnectionIndicator } from "../AssetTable/SymbolConnectionIndicator";

const sanitizeIsin = (input: string): string => {
  return input.replace(/[^0-9a-zA-Z]/gi, "");
};

const sanitizeSymbol = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9.]/gi, "");
};

const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

const isValidIsin = (isin: string): boolean => {
  return isin.trim().length === 12;
};

const isValidSymbol = (symbol: string): boolean => {
  return !symbol || /^[a-zA-Z0-9]{1,5}\.?[a-zA-Z0-9]+$/.test(symbol);
};

const isValidInput = (input: { name: string; isin: string }) => {
  return isValidName(input.name) && isValidIsin(input.isin);
};

export function AssetInputForm() {
  const [nameInputText, updateNameInputText] = useState("");
  const [isinInputText, updateIsinInputText] = useState("");
  const [symbolInputText, updateSymbolInputText] = useState("");
  const [checkSymbol, setCheckSymbol] = useState<string | null>(null);

  const addAssets = useAddAsset();

  const handleSubmitButton = () => {
    updateNameInputText("");
    updateIsinInputText("");
    updateSymbolInputText("");
    setCheckSymbol(null);
    addAssets({
      displayName: nameInputText,
      isin: isinInputText,
      symbol: symbolInputText,
    });
  };

  const handleCheckSymbol = () => {
    setCheckSymbol(symbolInputText);
  };

  const nameValid = isValidName(nameInputText) || !nameInputText;
  const isinValid = isValidIsin(isinInputText) || !isinInputText;
  const symbolValid = isValidSymbol(symbolInputText);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="asset-name"
            className="block text-sm font-medium text-text-muted mb-1.5"
          >
            Asset Name
            <span className="text-danger ml-1">*</span>
          </label>
          <input
            id="asset-name"
            type="text"
            value={nameInputText}
            onChange={(e) => updateNameInputText(e.target.value)}
            placeholder="Asset Name..."
            className={cn(
              "w-full px-3 py-2.5 rounded-md text-sm",
              "bg-bg-input border border-border text-text",
              "placeholder:text-text-dim",
              "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus",
              "transition-colors duration-150"
            )}
          />
          {!nameValid && nameInputText && (
            <p className="mt-1 text-xs text-danger">
              Please enter a non-empty string.
            </p>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="asset-isin"
            className="block text-sm font-medium text-text-muted mb-1.5"
          >
            ISIN
            <span className="text-danger ml-1">*</span>
          </label>
          <input
            id="asset-isin"
            type="text"
            value={isinInputText}
            onChange={(e) =>
              updateIsinInputText(sanitizeIsin(e.target.value).toUpperCase())
            }
            placeholder="ISIN..."
            maxLength={12}
            className={cn(
              "w-full px-3 py-2.5 rounded-md text-sm",
              "bg-bg-input border border-border text-text",
              "placeholder:text-text-dim",
              "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus",
              "transition-colors duration-150"
            )}
          />
          {!isinValid && isinInputText && (
            <p className="mt-1 text-xs text-danger">
              An ISIN contains exactly 12 characters.
            </p>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="asset-symbol"
            className="block text-sm font-medium text-text-muted mb-1.5"
          >
            Symbol
          </label>
          <input
            id="asset-symbol"
            type="text"
            value={symbolInputText}
            onChange={(e) =>
              updateSymbolInputText(
                sanitizeSymbol(e.target.value).toUpperCase()
              )
            }
            placeholder="Symbol..."
            className={cn(
              "w-full px-3 py-2.5 rounded-md text-sm",
              "bg-bg-input border border-border text-text",
              "placeholder:text-text-dim",
              "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus",
              "transition-colors duration-150"
            )}
          />
          {!symbolValid && symbolInputText && (
            <p className="mt-1 text-xs text-danger">
              A symbol contains five or fewer letters.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheckSymbol}
          disabled={!symbolInputText}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium",
            "bg-transparent border border-border text-text-muted",
            "hover:bg-bg-elevated hover:text-text",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg",
            "transition-colors duration-150"
          )}
        >
          Check Symbol
        </button>

        <button
          type="button"
          onClick={handleSubmitButton}
          disabled={!isValidInput({ name: nameInputText, isin: isinInputText })}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium",
            "bg-accent text-white",
            "hover:bg-accent-hover",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg",
            "transition-colors duration-150"
          )}
        >
          Submit
        </button>

        {checkSymbol && (
          <div className="ml-auto">
            <SymbolConnectionIndicator symbol={checkSymbol} />
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAddAsset } from "../../../hooks/assets/assetHooks";
import { SymbolConnectionIndicator } from "../AssetTable/SymbolConnectionIndicator";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { styles } from "./AssetInputForm.styles";

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

  const submitDisabled = !isValidInput({
    name: nameInputText,
    isin: isinInputText,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitDisabled) {
          handleSubmitButton();
        }
      }}
      className="w-full"
    >
      <div className={styles.formRow}>
        <Input
          id="asset-name"
          label={
            <>
              Asset Name
              <span className={styles.requiredMarker}>*</span>
            </>
          }
          state={!nameValid && nameInputText ? "error" : "default"}
          errorMessage={
            !nameValid && nameInputText
              ? "Please enter a non-empty string."
              : undefined
          }
          type="text"
          value={nameInputText}
          onChange={(e) => updateNameInputText(e.target.value)}
          placeholder="Asset Name..."
          className={styles.formField}
        />

        <Input
          id="asset-isin"
          label={
            <>
              ISIN
              <span className={styles.requiredMarker}>*</span>
            </>
          }
          state={!isinValid && isinInputText ? "error" : "default"}
          errorMessage={
            !isinValid && isinInputText
              ? "An ISIN contains exactly 12 characters."
              : undefined
          }
          type="text"
          value={isinInputText}
          onChange={(e) =>
            updateIsinInputText(sanitizeIsin(e.target.value).toUpperCase())
          }
          placeholder="ISIN..."
          maxLength={12}
          className={styles.formField}
        />

        <Input
          id="asset-symbol"
          label="Symbol"
          state={!symbolValid && symbolInputText ? "error" : "default"}
          errorMessage={
            !symbolValid && symbolInputText
              ? "A symbol contains five or fewer letters."
              : undefined
          }
          type="text"
          value={symbolInputText}
          onChange={(e) =>
            updateSymbolInputText(sanitizeSymbol(e.target.value).toUpperCase())
          }
          placeholder="Symbol..."
          className={styles.formField}
        />
      </div>

      <div className={styles.buttonRow}>
        <Button
          intent="ghost"
          disabled={!symbolInputText}
          onClick={handleCheckSymbol}
        >
          Check Symbol
        </Button>

        <Button intent="primary" disabled={submitDisabled} type="submit">
          Submit
        </Button>

        {checkSymbol && (
          <div className="ml-auto">
            <SymbolConnectionIndicator symbol={checkSymbol} />
          </div>
        )}
      </div>
    </form>
  );
}

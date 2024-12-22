import { ReactElement, useState } from "react";
import { useAddAsset } from "../../../hooks/assets/assetHooks";
import { Button } from "../../general/Button";
import { FormRowFlex } from "../../general/FormRowFlex/FormRowFlex";
import { TextInput } from "../../general/TextInput";
import CheckSymbolButton from "../CheckSymbolButton/CheckSymbolButton";
import styles from "./AssetInputForm.module.less";

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

const AssetInputForm = (): ReactElement => {
  let [nameInputText, updateNameInputText] = useState("");
  let [isinInputText, updateIsinInputText] = useState("");
  let [symbolInputText, updateSymbolInputText] = useState("");

  const assetMutation = useAddAsset();

  const handleSubmitButton = () => {
    updateNameInputText("");
    updateIsinInputText("");
    updateSymbolInputText("");
    assetMutation.mutate({
      displayName: nameInputText,
      isin: isinInputText,
      symbol: symbolInputText,
    });
  };

  return (
    <div className={styles.form}>
      <FormRowFlex>
        <TextInput
          onChange={(element) => {
            updateNameInputText(element.target.value);
          }}
          text={nameInputText}
          label={"Asset Name"}
          placeholder={"Asset Name..."}
          isMandatory={true}
          isValid={isValidName(nameInputText) || !nameInputText}
          errorMessage={"Please enter a non-empty string."}
        />
        <TextInput
          onChange={(element) => {
            updateIsinInputText(
              sanitizeIsin(element.target.value).toUpperCase()
            );
          }}
          text={isinInputText}
          label={"ISIN"}
          placeholder={"ISIN..."}
          isMandatory={true}
          isValid={isValidIsin(isinInputText) || !isinInputText}
          errorMessage={"An ISIN contains exactly 12 characters."}
        />
        <TextInput
          onChange={(element) => {
            updateSymbolInputText(
              sanitizeSymbol(element.target.value).toUpperCase()
            );
          }}
          text={symbolInputText}
          label={"Symbol"}
          placeholder={"Symbol..."}
          isValid={isValidSymbol(symbolInputText)}
          errorMessage={"A symbol contains five or fewer letters."}
        />
      </FormRowFlex>
      <div className={styles.buttons}>
        <CheckSymbolButton symbol={symbolInputText} />
        <Button
          label="Submit"
          isDisabled={
            !isValidInput({ name: nameInputText, isin: isinInputText })
          }
          onClick={handleSubmitButton}
          isPrimary={true}
        />
      </div>
    </div>
  );
};

export default AssetInputForm;

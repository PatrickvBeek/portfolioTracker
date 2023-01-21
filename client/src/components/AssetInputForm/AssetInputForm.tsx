import { ReactElement, useState } from "react";
import { useAddAsset } from "../../hooks/assets/assetHooks";
import { bemHelper } from "../../utility/bemHelper";
import { Button } from "../general/Button";
import { FormRowFlex } from "../general/FormRowFlex/FormRowFlex";
import { TextInput } from "../general/TextInput";
import "./AssetInputForm.css";

const { bemBlock, bemElement } = bemHelper("asset-input-form");

const sanitizeString = (input: string): string => {
  return input.replace(/[^0-9a-zA-Z]/gi, "");
};

const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};
const isValidIsin = (isin: string): boolean => {
  return isin.trim().length === 12;
};

const isValidWkn = (wkn: string): boolean => {
  return (
    !wkn ||
    (wkn.trim().length === 6 &&
      !(wkn.toUpperCase().includes("O") || wkn.toUpperCase().includes("I")))
  );
};

const isValidInput = (input: { name: string; isin: string }) => {
  return isValidName(input.name) && isValidIsin(input.isin);
};

const AssetInputForm = (): ReactElement => {
  let [nameInputText, updateNameInputText] = useState("");
  let [isinInputText, updateIsinInputText] = useState("");
  let [wknInputText, updateWknInputText] = useState("");

  const assetMutation = useAddAsset();

  const allEmpty = (): boolean => {
    return !(nameInputText || isinInputText || wknInputText);
  };

  const handleButtonClicked = () => {
    updateNameInputText("");
    updateIsinInputText("");
    updateWknInputText("");
    assetMutation.mutate({
      displayName: nameInputText,
      isin: isinInputText,
      wkn: wknInputText,
    });
  };

  return (
    <div className={bemBlock("")}>
      <FormRowFlex className={bemElement("form-row")}>
        <TextInput
          onChange={(element) => {
            updateNameInputText(element.target.value);
          }}
          text={nameInputText}
          label={"Asset Name"}
          placeholder={"Asset Name..."}
          isMandatory={true}
          isValid={isValidName(nameInputText) || allEmpty()}
          errorMessage={"Please enter a non-empty string."}
          className={"asset-input-name-field"}
        />
        <TextInput
          onChange={(element) => {
            updateIsinInputText(
              sanitizeString(element.target.value).toUpperCase()
            );
          }}
          text={isinInputText}
          label={"ISIN"}
          placeholder={"ISIN..."}
          isMandatory={true}
          isValid={isValidIsin(isinInputText) || allEmpty()}
          errorMessage={"An ISIN contains exactly 12 characters."}
          className={"asset-input-isin-field"}
        />
        <TextInput
          onChange={(element) => {
            updateWknInputText(
              sanitizeString(element.target.value).toUpperCase()
            );
          }}
          text={wknInputText}
          label={"WKN"}
          placeholder={"WKN..."}
          isValid={isValidWkn(wknInputText)}
          errorMessage={
            "A WKN contains exactly 6 characters and does not include 'O' or 'I'."
          }
          className={"asset-input-wkn-field"}
        />
      </FormRowFlex>
      <Button
        label="Submit"
        isDisabled={!isValidInput({ name: nameInputText, isin: isinInputText })}
        onClick={handleButtonClicked}
        className={bemElement("submit-button")}
        isPrimary={true}
      />
    </div>
  );
};

export default AssetInputForm;

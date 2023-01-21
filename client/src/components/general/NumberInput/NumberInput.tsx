import React, { ReactElement, useState } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import { InputWrapper } from "../InputFieldWrapper/InputFieldWrapper";
import { InputProps } from "../types";

const { bemElement } = bemHelper("input");

export type NumberInputValue = number | undefined;

export interface NumberInputProps extends InputProps {
  onChange: (value: NumberInputValue) => void;
  digits?: number;
  defaultValue?: number;
}

export const NumberInput = ({
  isMandatory,
  isValid,
  label,
  className,
  errorMessage,
  onChange,
  digits,
  defaultValue,
  ...rest
}: NumberInputProps): ReactElement => {
  const [display, setDisplay] = useState(
    getStringOfDefaultValue(defaultValue, digits)
  );

  const potentialNumberRegex = new RegExp(
    `^(-|\\+)?\\d{0,}\\.?\\d{0,${digits || ""}}$`
  );

  const numberRegex = new RegExp(
    `^(-|\\+)?\\d{1,}(\\.\\d{0,${digits || ""}})?$`
  );

  const handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (
    event
  ) => {
    const amount = insertPotentiallyMissingZero(event.target.value);
    if (amount.match(potentialNumberRegex)) {
      setDisplay(amount);
      amount.match(numberRegex)
        ? onChange(parseFloat(amount))
        : onChange(undefined);
    }
  };

  return (
    <InputWrapper
      isValid={isValid}
      className={className}
      errorMessage={errorMessage}
      label={label}
    >
      <input
        id={`${label?.replaceAll(" ", "-") || ""}-input`}
        className={bemElement("field", isMandatory ? "mandatory" : "")}
        type="text"
        value={display}
        onChange={handleChange}
        {...rest}
      ></input>
    </InputWrapper>
  );
};

const getStringOfDefaultValue: (
  value: number | undefined,
  digits: number | undefined
) => string = (value, digits) => {
  if (value === undefined) {
    return "";
  }
  if (!digits) {
    return value.toString();
  }

  const currentDigits = value.toString().split(".")[1]?.length || 0;
  return value.toFixed(Math.min(digits, currentDigits)).toString();
};

function insertPotentiallyMissingZero(number: string): string {
  if (number.match(/^(-|\+)?\./)) {
    return number.replace(".", "0.");
  }
  return number;
}

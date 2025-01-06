import React, { ReactElement, useState } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import { InputWrapper } from "../InputFieldWrapper/InputFieldWrapper";
import { InputProps } from "../types";

const { bemElement } = bemHelper("input");

export type NumberInputValue = number | undefined;

export interface NumberInputProps extends InputProps {
  onChange: (value: NumberInputValue) => void;
  defaultValue?: number;
}

export const NumberInput = ({
  isMandatory,
  isValid,
  label,
  className,
  errorMessage,
  onChange,
  defaultValue,
  ...rest
}: NumberInputProps): ReactElement => {
  const [display, setDisplay] = useState(defaultValue?.toString() || "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplay = event.target.value;
    setDisplay(newDisplay);
    const parsedValue = parseFloat(newDisplay);
    onChange(Number.isNaN(parsedValue) ? undefined : parsedValue);
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
        type="number"
        step={0.01}
        value={display}
        onChange={handleChange}
        autoComplete="off"
        {...rest}
      ></input>
    </InputWrapper>
  );
};

import React, { ReactElement } from "react";
import { bemHelper } from "../../utility/bemHelper";
import "./Input.css";
import { InputWrapper } from "./InputFieldWrapper/InputFieldWrapper";
import { InputProps } from "./types";

const { bemElement } = bemHelper("input");

export interface TextInputProps extends InputProps {
  text: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput = ({
  text,
  isMandatory,
  isValid,
  label,
  errorMessage,
  onChange,
  className,
  ...rest
}: TextInputProps): ReactElement => {
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
        value={text}
        onChange={onChange}
        {...rest}
      ></input>
    </InputWrapper>
  );
};

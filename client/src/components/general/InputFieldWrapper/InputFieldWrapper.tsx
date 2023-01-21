import { ReactElement } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import "../Input.css";
import { InputProps } from "../types";

const { bemBlock, bemElement } = bemHelper("input");

export interface InputWrapperProps extends InputProps {
  children: ReactElement;
}

export const InputWrapper = ({
  children,
  isValid,
  label,
  errorMessage,
  className,
}: InputWrapperProps): ReactElement => {
  return (
    <div className={bemBlock(className)}>
      {label && (
        <label
          htmlFor={`${label?.replaceAll(" ", "-")}-input`}
          className={bemElement("label")}
        >
          {label}
        </label>
      )}
      {children}
      {!isValid && (
        <div className={bemElement("error-message")}>{errorMessage}</div>
      )}
    </div>
  );
};

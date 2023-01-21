import { ReactElement, useState } from "react";
import { bemHelper } from "../../utility/bemHelper";
import "./Input.css";
import { InputWrapper } from "./InputFieldWrapper/InputFieldWrapper";
import { InputProps } from "./types";

const { bemElement } = bemHelper("input");

export type DateInputValue = Date | undefined;

export interface DateInputProps extends InputProps {
  onChange: (date: Date | undefined) => void;
  defaultDate?: Date;
}

export const DateInput = ({
  isMandatory,
  isValid,
  label,
  errorMessage,
  className,
  onChange,
  defaultDate,
}: DateInputProps): ReactElement => {
  const [displayedDate, setDisplayedDate] = useState(formatDate(defaultDate));
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setDisplayedDate(value);
    const timestamp = Date.parse(value);
    onChange(timestamp ? new Date(timestamp) : undefined);
  };

  return (
    <InputWrapper
      className={className}
      isValid={isValid}
      label={label}
      errorMessage={errorMessage}
    >
      <input
        id={`${label?.replaceAll(" ", "-") || ""}-input`}
        value={displayedDate}
        className={bemElement("field", isMandatory ? "mandatory" : "")}
        type="date"
        onChange={handleChange}
      ></input>
    </InputWrapper>
  );
};

const addLeadingZero: (n: number) => string = (n) => {
  if (n <= 9) {
    return "0" + n.toString();
  }
  return n.toString();
};

const formatDate: (date: Date | undefined) => string = (date) => {
  if (!date) {
    return "";
  }
  return (
    date.getFullYear() +
    "-" +
    addLeadingZero(date.getMonth() + 1) +
    "-" +
    addLeadingZero(date.getDate())
  );
};

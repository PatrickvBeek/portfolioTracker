import { bemHelper } from "../../../utility/bemHelper";
import { InputWrapper } from "../InputFieldWrapper/InputFieldWrapper";
import { InputProps } from "../types";

const { bemElement } = bemHelper("input");
export interface DropdownOption {
  id: string;
  optionName: string;
}

export interface DropdownProps extends InputProps {
  onSelect: (s: string) => void;
  options: DropdownOption[];
  selected: string;
}

const Dropdown = ({
  isValid,
  label,
  errorMessage,
  isMandatory,
  className,
  onSelect,
  options,
  selected,
}: DropdownProps) => {
  return (
    <InputWrapper
      className={className}
      isValid={isValid}
      label={label}
      errorMessage={errorMessage}
    >
      <select
        onChange={(e) => onSelect(e.target.value)}
        id={`${label?.replaceAll(" ", "-") || ""}-input`}
        className={bemElement("field", isMandatory ? "mandatory" : "")}
        value={selected}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.optionName}
          </option>
        ))}
      </select>
    </InputWrapper>
  );
};

export default Dropdown;

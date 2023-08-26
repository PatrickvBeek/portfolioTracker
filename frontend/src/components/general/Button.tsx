import { ReactElement } from "react";
import { bemHelper } from "../../utility/bemHelper";
import "./Button.css";

const { bemBlock } = bemHelper("button");

export interface ButtonProps {
  onClick: () => void;
  label: string;
  isDisabled?: boolean;
  isPrimary?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const Button = ({
  onClick,
  label,
  isDisabled,
  isPrimary,
  className,
  autoFocus,
}: ButtonProps): ReactElement => {
  return (
    <button
      className={bemBlock(className, {
        [`primary${isDisabled ? "-disabled" : ""}`]: isPrimary,
        [`secondary${isDisabled ? "-disabled" : ""}`]: !isPrimary,
      })}
      onClick={onClick}
      disabled={isDisabled}
      autoFocus={autoFocus}
    >
      {label}
    </button>
  );
};

import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { ReactElement, forwardRef } from "react";

export interface ButtonProps {
  onClick: () => void;
  label: string;
  isDisabled?: boolean;
  isPrimary?: boolean;
  className?: string;
  autoFocus?: boolean;
}

interface ExtendedButtonProps
  extends ButtonProps,
    Omit<
      MuiButtonProps,
      | "onClick"
      | "disabled"
      | "children"
      | "variant"
      | "className"
      | "autoFocus"
    > {}

export const Button = forwardRef<HTMLButtonElement, ExtendedButtonProps>(
  (
    {
      onClick,
      label,
      isDisabled,
      isPrimary,
      className,
      autoFocus,
      ...muiProps
    },
    ref
  ): ReactElement => {
    return (
      <MuiButton
        ref={ref}
        variant={isPrimary ? "contained" : "outlined"}
        onClick={onClick}
        disabled={isDisabled}
        className={className}
        autoFocus={autoFocus}
        {...muiProps}
      >
        {label}
      </MuiButton>
    );
  }
);

import { ButtonProps as MuiButtonProps } from "@mui/material";
import { ReactElement, forwardRef } from "react";
import { StyledMuiButton } from "./StyledComponents";

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
      <StyledMuiButton
        ref={ref}
        isPrimary={isPrimary}
        onClick={onClick}
        disabled={isDisabled}
        className={className}
        autoFocus={autoFocus}
        {...muiProps}
      >
        {label}
      </StyledMuiButton>
    );
  }
);

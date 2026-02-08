import React from "react";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onSelect"
> {
  isMandatory?: boolean;
  isValid?: boolean;
  label?: string;
  errorMessage?: string;
  className?: string;
}

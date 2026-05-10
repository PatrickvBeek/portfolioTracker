import React, { ComponentPropsWithRef, forwardRef, useId } from "react";
import { cn } from "../../utility/cn";
import { selectVariants } from "./select.styles";

type SelectState = "default" | "error";

type SelectProps = ComponentPropsWithRef<"select"> & {
  state?: SelectState;
  label?: React.ReactNode;
  errorMessage?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      state = "default",
      label,
      errorMessage,
      className,
      name,
      "aria-describedby": externalDescribedBy,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = useId();
    const errorId = errorMessage ? `${selectId}-error` : undefined;
    const hasError = state === "error" && !!errorMessage;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(externalDescribedBy, errorId) || undefined}
          className={cn(selectVariants({ state }))}
          {...props}
        >
          {children}
        </select>
        {hasError && (
          <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

import React, { ComponentPropsWithRef, forwardRef, useId } from "react";
import { cn } from "../../utility/cn";
import { inputVariants } from "./input.styles";

type InputState = "default" | "error";

type InputProps = ComponentPropsWithRef<"input"> & {
  state?: InputState;
  label?: React.ReactNode;
  errorMessage?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      state = "default",
      label,
      errorMessage,
      className,
      id: explicitId,
      "aria-describedby": externalDescribedBy,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = explicitId ?? autoId;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const hasError = state === "error" && !!errorMessage;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(externalDescribedBy, errorId) || undefined}
          className={cn(inputVariants({ state }))}
          {...props}
        />
        {hasError && (
          <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

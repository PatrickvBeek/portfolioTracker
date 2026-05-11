import React, {
  ComponentPropsWithRef,
  forwardRef,
  useState,
  useId,
} from "react";
import { cn } from "../../utility/cn";
import { numberInputVariants, styles } from "./number-input.styles";

export type NumberInputValue = number | undefined;

interface NumberInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "onChange"
> {
  onChange: (value: NumberInputValue) => void;
  defaultValue?: number;
  isMandatory?: boolean;
  isValid?: boolean;
  label?: React.ReactNode;
  errorMessage?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      onChange,
      defaultValue,
      isMandatory = false,
      isValid,
      label,
      errorMessage,
      className,
      "aria-describedby": externalDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = useId();
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const hasError = isValid === false && !!errorMessage;

    const [display, setDisplay] = useState(defaultValue?.toString() ?? "");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplay = event.target.value;
      setDisplay(newDisplay);
      const parsedValue = parseFloat(newDisplay);
      onChange(Number.isFinite(parsedValue) ? parsedValue : undefined);
    };

    const inputState = hasError ? "error" : "default";

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="number"
          step={0.01}
          value={display}
          onChange={handleChange}
          autoComplete="off"
          aria-invalid={hasError || undefined}
          aria-describedby={cn(externalDescribedBy, errorId) || undefined}
          className={cn(
            numberInputVariants({
              state: inputState,
              mandatory: isMandatory,
            })
          )}
          {...props}
        />
        {hasError && (
          <p id={errorId} className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

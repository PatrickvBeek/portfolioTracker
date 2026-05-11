import React, {
  ComponentPropsWithRef,
  forwardRef,
  useId,
  useState,
} from "react";
import { cn } from "../../utility/cn";
import { dateInputVariants, styles } from "./date-input.styles";

type DateInputState = "default" | "error";

export type DateInputValue = Date | undefined;

interface DateInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "onChange"
> {
  onChange: (date: Date | undefined) => void;
  defaultDate?: Date;
  isMandatory?: boolean;
  isValid?: boolean;
  label?: React.ReactNode;
  errorMessage?: string;
}

const addLeadingZero = (n: number): string => {
  if (n <= 9) {
    return "0" + n.toString();
  }
  return n.toString();
};

const formatDate = (date: Date | undefined): string => {
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

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      onChange,
      defaultDate,
      isMandatory,
      isValid,
      label,
      errorMessage,
      className,
      "aria-describedby": externalDescribedBy,
      ...props
    },
    ref
  ) => {
    const [displayedDate, setDisplayedDate] = useState(formatDate(defaultDate));
    const inputId = useId();
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const hasError = isValid === false && !!errorMessage;
    const state: DateInputState = hasError ? "error" : "default";

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      setDisplayedDate(value);
      const timestamp = Date.parse(value);
      onChange(timestamp ? new Date(timestamp) : undefined);
    };

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
          type="date"
          value={displayedDate}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(externalDescribedBy, errorId) || undefined}
          className={cn(dateInputVariants({ state, mandatory: !!isMandatory }))}
          onChange={handleChange}
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

DateInput.displayName = "DateInput";

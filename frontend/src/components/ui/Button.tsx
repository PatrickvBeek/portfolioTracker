import { ComponentPropsWithRef, forwardRef } from "react";
import { cn } from "../../utility/cn";
import { buttonVariants } from "./button.styles";

type ButtonIntent = "primary" | "ghost" | "danger" | "danger-ghost";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  intent?: ButtonIntent;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ intent = "primary", className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={disabled}
        className={cn(
          buttonVariants({ intent, disabled: !!disabled }),
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

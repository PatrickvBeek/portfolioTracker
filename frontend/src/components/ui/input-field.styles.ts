import { cva } from "class-variance-authority";

export const inputFieldVariants = cva(
  "w-full px-3 py-2.5 rounded-md text-sm bg-bg-input border text-text placeholder:text-text-dim focus:outline-none transition-colors duration-150",
  {
    variants: {
      state: {
        default:
          "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus",
        error:
          "border-danger focus:border-danger focus:ring-1 focus:ring-danger",
      },
      mandatory: {
        true: "border-l-4 border-l-accent",
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      mandatory: false,
    },
  }
);

export const inputFieldStyles = {
  label: "block text-sm font-medium text-text-muted mb-1.5",
  errorMessage: "mt-1 text-xs text-danger",
} as const;

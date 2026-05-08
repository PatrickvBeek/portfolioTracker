import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "w-full px-3 py-2.5 rounded-md text-sm bg-bg-input border text-text placeholder:text-text-dim focus:outline-none transition-colors duration-150",
  {
    variants: {
      state: {
        default:
          "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus",
        error:
          "border-danger focus:border-danger focus:ring-1 focus:ring-danger",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

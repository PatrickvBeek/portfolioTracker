import { cva } from "class-variance-authority";

export const tagVariants = cva(
  "inline-flex items-center rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg px-3 py-1",
  {
    variants: {
      selected: {
        true: "bg-accent text-white hover:bg-accent-hover",
        false:
          "bg-transparent border border-border text-text-muted hover:bg-bg-elevated hover:text-text",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

import { cva } from "class-variance-authority";

export const toggleGroupVariants = cva(
  "isolate inline-flex items-center rounded-md"
);

export const toggleItemVariants = cva(
  "px-3 py-1 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg border first:rounded-l-md last:rounded-r-md -ml-px first:ml-0",
  {
    variants: {
      selected: {
        true: "bg-accent text-white border-accent hover:bg-accent-hover z-10",
        false:
          "bg-bg-card text-text-muted border-border hover:bg-bg-elevated hover:text-text",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

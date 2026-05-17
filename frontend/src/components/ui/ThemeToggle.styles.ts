import { cva } from "class-variance-authority";

export const themeButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg",
  {
    variants: {
      selected: {
        true: "bg-accent-soft text-accent",
        false: "text-text-dim hover:text-text-muted hover:bg-bg-elevated",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export const styles = {
  container:
    "inline-flex items-center gap-0.5 rounded-md border border-border bg-bg-card p-0.5",
};

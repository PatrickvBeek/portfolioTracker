import { cva } from "class-variance-authority";

export const headingVariants = cva("font-medium", {
  variants: {
    level: {
      h1: "text-2xl md:text-3xl font-bold text-text",
      h2: "text-sm font-medium text-text-muted uppercase tracking-wider mb-4",
      section:
        "text-sm font-medium text-text-muted uppercase tracking-wider mb-4",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export const styles = {
  subtitle: "text-text-muted",
} as const;

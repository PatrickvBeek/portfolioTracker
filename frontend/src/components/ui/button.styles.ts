import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "rounded-md text-sm font-medium focus:outline-none transition-colors duration-150",
  {
    variants: {
      intent: {
        primary:
          "px-5 py-2 bg-accent text-white hover:bg-accent-hover focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg",
        ghost:
          "px-4 py-2 bg-transparent border border-border text-text-muted hover:bg-bg-elevated hover:text-text focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg",
        danger:
          "px-4 py-2 bg-danger text-white hover:bg-danger-hover focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-bg-card",
        "danger-ghost":
          "p-2 text-text-muted hover:text-danger hover:bg-danger-soft focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-bg-card",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      {
        intent: "ghost",
        disabled: true,
        class: "opacity-50 cursor-not-allowed",
      },
      {
        intent: "primary",
        disabled: true,
        class: "opacity-50 cursor-not-allowed",
      },
    ],
    defaultVariants: {
      intent: "primary",
      disabled: false,
    },
  }
);

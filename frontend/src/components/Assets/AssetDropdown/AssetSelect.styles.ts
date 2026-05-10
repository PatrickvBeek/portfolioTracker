import { cva } from "class-variance-authority";

export const assetDropdownTriggerVariants = cva(
  "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm bg-bg-input border text-text focus:outline-none transition-colors duration-150",
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

export const styles = {
  popoverContent:
    "w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-bg-card shadow-md p-0",
  commandRoot: "flex flex-col overflow-hidden",
  commandInput:
    "w-full px-3 py-2.5 text-sm bg-transparent text-text placeholder:text-text-dim focus:outline-none border-b border-border",
  commandList: "max-h-64 overflow-y-auto overflow-x-hidden",
  commandEmpty: "py-6 text-center text-sm text-text-muted",
  commandItem:
    "flex flex-col items-start px-3 py-2.5 text-sm cursor-pointer text-text data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-hover",
  optionMainText: "text-sm text-text",
  optionFinePrint: "text-xs text-text-muted",
} as const;

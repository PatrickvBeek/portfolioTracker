import { inputFieldVariants } from "../../ui/input-field.styles";

export { inputFieldVariants as assetDropdownTriggerVariants };

export const triggerLayout = "flex items-center justify-between";

export const styles = {
  label: "block text-sm font-medium text-text-muted mb-1.5",
  errorMessage: "mt-1 text-xs text-danger",
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

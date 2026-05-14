import { cn } from "../../utility/cn";

export const dialogStyles = {
  overlay:
    "fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow",
  content:
    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-bg-card rounded-lg shadow-2xl border border-border p-6 focus:outline-none data-[state=open]:animate-contentShow",
  title: "text-lg font-semibold text-text",
  closeButton:
    "absolute right-3 top-3 inline-flex items-center justify-center rounded-md p-1 text-text-muted hover:text-text hover:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-border-focus",
} as const;

export const styles = {
  overlay: dialogStyles.overlay,
  content: cn(dialogStyles.content, "max-w-lg"),
  title: dialogStyles.title,
  closeButton: dialogStyles.closeButton,
} as const;

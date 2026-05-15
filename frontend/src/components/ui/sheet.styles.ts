import { cva } from "class-variance-authority";

const sheetContentVariants = cva(
  "fixed inset-y-0 z-[1200] w-80 min-[480px]:w-96 flex flex-col bg-bg-card shadow-2xl border-border focus:outline-none data-[state=open]:animate-sheetSlideIn",
  {
    variants: {
      side: {
        right: "right-0 border-l",
        left: "left-0 border-r",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export const sheetStyles = {
  overlay:
    "fixed inset-0 z-[1199] bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow",
  content: sheetContentVariants,
  header: "flex items-center justify-between border-b border-border px-4 py-3",
  title: "text-lg font-semibold text-text",
  closeButton:
    "inline-flex items-center justify-center rounded-md p-1 text-text-muted hover:text-text hover:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-border-focus",
  body: "flex-1 overflow-y-auto p-6",
} as const;

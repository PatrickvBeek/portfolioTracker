import { cva } from "class-variance-authority";

export const styles = {
  tableWrapper:
    "hidden md:block overflow-hidden rounded-lg border border-border",
  table: "w-full",
  tableHeaderRow: "bg-bg-elevated border-b border-border",
  tableHeaderCell:
    "px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider",
  tableRowExpandable:
    "border-b border-border hover:bg-bg-elevated/50 transition-colors duration-150 cursor-pointer",
  tableCell: "px-4 py-3",
  cellName: "font-medium text-text",
  cellIsin: "font-mono text-sm text-text-muted",
  cellEmpty: "text-text-dim text-sm",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
  emptyStateSecondary: "text-xs mt-1 text-text-dim",
  expandedCell: "p-0 border-b border-border bg-bg-card",
  mobileCardExpandable:
    "p-4 rounded-lg border border-border bg-bg-card hover:border-border-focus transition-colors duration-150",
  mobileCardExpanded:
    "rounded-lg border border-border-focus bg-bg-card overflow-hidden",
  mobileCardInner: "space-y-3",
  mobileLabel: "text-xs text-text-muted mb-1",
  chevron: cva("w-4 h-4 transition-transform duration-200 text-text-muted", {
    variants: {
      isExpanded: {
        true: "rotate-180",
        false: "",
      },
    },
  }),
  collapsibleContent:
    "data-[state=open]:animate-collapsible-slide-down data-[state=closed]:animate-collapsible-slide-up overflow-hidden border-t border-border",
  footer: "mt-4 text-sm text-text-muted",
  footerCount: "font-medium text-text",
} as const;

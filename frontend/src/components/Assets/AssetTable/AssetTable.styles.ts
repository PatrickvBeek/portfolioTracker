export const styles = {
  tableWrapper:
    "hidden md:block overflow-hidden rounded-lg border border-border",
  table: "w-full",
  tableHeaderRow: "bg-bg-elevated border-b border-border",
  tableHeaderCell:
    "px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider",
  tableRow:
    "border-b border-border hover:bg-bg-elevated/50 transition-colors duration-150",
  tableCell: "px-4 py-3",
  cellName: "font-medium text-text",
  cellIsin: "font-mono text-sm text-text-muted",
  cellEmpty: "text-text-dim text-sm",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
  emptyStateSecondary: "text-xs mt-1 text-text-dim",
  mobileCard:
    "p-4 rounded-lg border border-border bg-bg-card hover:border-border-focus transition-colors duration-150",
  mobileCardInner: "space-y-3",
  mobileLabel: "text-xs text-text-muted mb-1",
  mobileDeleteSection: "pt-3 border-t border-border",
  footer: "mt-4 text-sm text-text-muted",
  footerCount: "font-medium text-text",
} as const;

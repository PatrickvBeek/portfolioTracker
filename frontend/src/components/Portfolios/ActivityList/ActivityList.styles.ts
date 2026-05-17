import { cva } from "class-variance-authority";
import { pageLayout } from "../../ui/page-layout.styles";

export const nodeVariants = cva(
  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0",
  {
    variants: {
      type: {
        buy: "bg-success-soft text-success",
        sell: "bg-danger-soft text-danger",
        dividend: "bg-accent-soft text-accent",
      },
    },
    defaultVariants: {
      type: "buy",
    },
  }
);

export const styles = {
  container: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
  timeline: "relative mt-4",
  item: "flex gap-4",
  rail: "relative flex flex-col items-center shrink-0",
  connector: "flex-1 w-px bg-border",
  card: "flex-1 min-w-0 rounded-lg border border-border bg-bg-card px-4 py-3 hover:border-border-focus transition-colors duration-150 mb-3",
  cardInner: "space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4",
  header:
    "flex justify-between items-baseline sm:flex-col sm:justify-start sm:min-w-[120px] sm:shrink-0",
  assetCell: "font-medium text-text min-w-0 truncate",
  dateCell: "text-xs text-text-muted whitespace-nowrap sm:text-sm",
  metricsGrid:
    "grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-t border-border sm:grid-cols-3 sm:py-0 sm:border-0 sm:flex sm:flex-wrap sm:gap-4 sm:flex-1",
  metricBlock: "sm:flex-1 sm:min-w-[80px]",
  metricLabel: "text-xs text-text-muted sm:mb-1",
  metricValue: "text-sm font-mono text-text",
  actionRow:
    "flex justify-end items-center border-t border-border pt-2 sm:border-0 sm:pt-0 sm:ml-auto sm:shrink-0 sm:pl-4",
  showAllButton: "mt-2 text-center",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
  emptyStateSecondary: "text-xs mt-1 text-text-dim",
  infoDialogBody: "text-text-muted mb-6",
  infoDialogActions: "flex justify-end",
} as const;

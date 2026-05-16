import { cva } from "class-variance-authority";

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
  container: "w-full",
  timeline: "relative mt-4",
  item: "flex gap-4",
  rail: "relative flex flex-col items-center shrink-0",
  connector: "flex-1 w-px bg-border",
  card: "flex-1 rounded-lg border border-border bg-bg-card px-4 py-3 hover:border-border-focus transition-colors duration-150 mb-3",
  cardInner: "flex items-center gap-4",
  dateCell: "text-sm text-text-muted whitespace-nowrap",
  assetCell: "font-medium text-text min-w-0 truncate",
  piecesCell: "text-sm text-text-muted",
  amountCell: "text-sm font-medium text-text whitespace-nowrap",
  priceCell: "text-xs text-text-dim whitespace-nowrap",
  feeCell: "text-xs text-text-dim whitespace-nowrap",
  taxCell: "text-xs text-text-dim whitespace-nowrap",
  actionCell: "ml-auto shrink-0",
  mobileCard:
    "flex-1 rounded-lg border border-border bg-bg-card hover:border-border-focus transition-colors duration-150 mb-3 p-4",
  mobileCardInner: "space-y-2",
  mobileHeader: "flex items-center gap-2",
  mobileAssetName: "font-medium text-text truncate",
  mobileDate: "text-xs text-text-muted ml-auto",
  mobileDetails: "flex flex-wrap gap-x-4 gap-y-1 text-sm",
  mobileDetailItem: "text-text-muted",
  mobileDetailValue: "font-medium text-text",
  mobileAmountSection:
    "pt-2 border-t border-border flex justify-between items-center",
  mobileAmount: "font-medium text-text",
  mobileSecondaryDetails: "flex flex-wrap gap-x-3 text-xs text-text-dim",
  showAllButton: "mt-2 text-center",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
  emptyStateSecondary: "text-xs mt-1 text-text-dim",
  infoDialogBody: "text-text-muted mb-6",
  infoDialogActions: "flex justify-end",
} as const;

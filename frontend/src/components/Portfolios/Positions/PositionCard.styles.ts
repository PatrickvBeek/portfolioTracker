export const styles = {
  card: "border border-border rounded-lg bg-bg-card overflow-hidden",
  cardBody: "sm:flex sm:items-start sm:gap-6 px-4 py-3",
  header:
    "flex justify-between items-baseline sm:flex-col sm:justify-start sm:min-w-[140px] sm:shrink-0",
  assetName: "text-text font-medium",
  pieces: "text-text font-mono text-sm",
  metricsGrid:
    "grid grid-cols-2 gap-4 py-3 px-4 sm:flex sm:flex-row sm:gap-6 sm:py-0 sm:px-0 sm:flex-1",
  metricBlock: "sm:flex-1",
  metricLabel: "text-text-muted text-xs mb-1",
  metricValue: "text-text font-mono text-sm",
  headerWrapper: "flex border-t border-border",
  trigger:
    "flex items-center justify-between w-full px-4 py-3 cursor-pointer select-none hover:bg-bg-elevated/50 transition-colors text-sm text-text-muted",
  chevron:
    "w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180",
  content:
    "data-[state=open]:animate-accordion-slide-down data-[state=closed]:animate-accordion-slide-up overflow-hidden",
  loading: "flex items-center gap-2 text-text-muted text-sm",
} as const;

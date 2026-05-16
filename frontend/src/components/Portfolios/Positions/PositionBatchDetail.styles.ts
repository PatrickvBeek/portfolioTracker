export const styles = {
  container: "space-y-6 p-4",
  section: "space-y-3",
  sectionHeading:
    "text-sm font-medium text-text-muted uppercase tracking-wider",
  batchCard:
    "bg-bg-card border border-border rounded-lg p-4 space-y-3 sm:space-y-0 sm:flex sm:items-start sm:gap-6 hover:border-border-focus transition-colors duration-150",
  batchDate:
    "text-sm font-medium text-text sm:min-w-[100px] sm:shrink-0 sm:pt-3",
  metricsGrid:
    "grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-row sm:gap-6 sm:flex-1 sm:pt-3",
  metricBlock: "sm:flex-1",
  metricLabel: "text-xs text-text-muted",
  metricValue: "text-sm font-mono text-text",
  totalsRow:
    "bg-bg-elevated border border-border rounded-lg p-4 sm:flex sm:items-start sm:gap-6",
  totalsLabel:
    "text-sm font-medium text-text sm:min-w-[100px] sm:shrink-0 sm:pt-3",
  totalsMetrics: "sm:flex sm:flex-row sm:gap-6 sm:flex-1 sm:pt-3",
} as const;

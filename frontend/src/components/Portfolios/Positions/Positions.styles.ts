export const styles = {
  tabList:
    "flex items-center gap-1 border-b border-border overflow-x-auto pb-px",
  tabTrigger:
    "px-4 py-2 text-sm font-medium transition-colors duration-150 text-text-muted border-b-2 border-transparent -mb-px hover:text-text whitespace-nowrap",
  tabTriggerActive: "text-accent border-accent",
  tabContent: "pt-4",
  cardGrid: "grid grid-cols-1 gap-4",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
} as const;

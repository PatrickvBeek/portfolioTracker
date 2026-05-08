export const styles = {
  accordion: "mb-4 border border-border rounded-md bg-bg-card overflow-hidden",
  header: "flex",
  trigger:
    "flex items-center gap-2 cursor-pointer select-none px-4 py-3 font-medium text-sm hover:bg-bg-elevated transition-colors w-full border-b border-border [&[data-state=open]>svg]:rotate-180",
  chevron: "w-4 h-4 transition-transform duration-200 ml-auto",
  content:
    "flex flex-col gap-4 p-4 overflow-hidden data-[state=open]:animate-accordion-slide-down data-[state=closed]:animate-accordion-slide-up",
  controlsGrid:
    "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 items-start max-md:grid-cols-1 max-md:gap-4",
  controlGroup: "flex flex-col gap-2 min-w-0 overflow-hidden",
  label: "font-medium text-accent text-xs",
  scenarioDetails: "mt-2 pt-2 border-t border-border",
  displayOptions: "flex flex-col gap-2",
  chip: "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted",
  infoContainer: "flex items-center gap-2",
  infoIcon: "w-4 h-4 text-text-dim",
  inputAdornment: "flex items-center gap-1",
  adornmentText: "px-2 text-text-muted",
} as const;

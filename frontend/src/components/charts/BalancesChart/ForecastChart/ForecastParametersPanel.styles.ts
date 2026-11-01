import { forecastPanelStyles } from "../../forecastPanel.styles";

export const styles = {
  accordion: "mb-4 border border-border rounded-md bg-bg-card overflow-hidden",
  header: "flex",
  trigger:
    "flex items-center gap-2 cursor-pointer select-none px-4 py-3 font-medium text-sm hover:bg-bg-elevated transition-colors w-full border-b border-border [&[data-state=open]>svg]:rotate-180",
  chevron: "w-4 h-4 transition-transform duration-200 ml-auto",
  content:
    "flex flex-col gap-4 p-4 overflow-hidden data-[state=open]:animate-accordion-slide-down data-[state=closed]:animate-accordion-slide-up",
  controlsGrid: forecastPanelStyles.controlsGrid,
  controlGroup: forecastPanelStyles.controlGroup,
  label: forecastPanelStyles.label,
  scenarioDetails: "mt-2 pt-2 border-t border-border",
  displayOptions: "flex flex-col gap-2",
  infoContainer: "flex items-center gap-2",
  infoIcon: "w-4 h-4 text-text-dim",
  inputAdornment: forecastPanelStyles.inputAdornment,
  adornmentText: forecastPanelStyles.adornmentText,
} as const;

import { forecastPanelStyles } from "../charts/forecastPanel.styles";
import { pageLayout } from "../ui/page-layout.styles";

export const styles = {
  container: pageLayout.pageContainer,
  sectionCard: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
  headline: "text-2xl font-semibold text-text tabular-nums",
  headlineMuted: "text-sm text-text-muted",
  errorText: "text-sm text-danger",
  meter: "flex h-3 w-full overflow-hidden rounded-full bg-bg-elevated",
  meterSuccess: "h-full bg-success",
  meterRuin: "h-full flex-1 bg-danger",
  meterLabels: "flex justify-between text-xs text-text-muted",
  bodyText: "text-sm text-text",
  metricLabel: "text-xs text-text-muted",
  metricValue: "text-lg font-semibold text-text tabular-nums",
  ruinNote: "text-sm text-danger",
  note: "text-xs text-text-muted",
  info:
    "flex items-start gap-2 rounded-md border border-accent-muted " +
    "bg-accent-soft p-3 text-sm text-text-muted",
  infoIcon: "w-4 h-4 shrink-0 text-accent",
  emptyState: "text-center p-12",
  controlsGrid: forecastPanelStyles.controlsGrid,
  controlGroup: forecastPanelStyles.controlGroup,
  label: forecastPanelStyles.label,
  inputWidth: "w-[14ch]",
  inputAdornment: forecastPanelStyles.inputAdornment,
  adornmentText: forecastPanelStyles.adornmentText,
  helperText: "text-xs text-text-muted",
  formGroup:
    "flex flex-col gap-4 border-t border-border pt-6 mt-6 " +
    "first-of-type:border-0 first-of-type:pt-0 first-of-type:mt-0",
  actionText: "self-start text-xs font-medium text-accent hover:underline",
  validationText: "text-sm text-danger",
  planTimeline: "flex flex-col gap-2 border-t border-border pt-4",
  timelineTrack: "flex h-2 w-full overflow-hidden rounded-full bg-bg-elevated",
  timelineBuildUp: "h-full bg-accent",
  timelineWithdrawal: "h-full bg-success",
  timelineLabels: "flex justify-between text-xs text-text-muted",
  planDates: "flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-muted",
} as const;

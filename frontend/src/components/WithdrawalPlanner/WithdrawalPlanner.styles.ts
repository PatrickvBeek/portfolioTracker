import { cva } from "class-variance-authority";
import { forecastPanelStyles } from "../charts/forecastPanel.styles";
import { pageLayout } from "../ui/page-layout.styles";

export const headlineVariants = cva("text-3xl font-semibold", {
  variants: {
    tone: {
      safe: "text-success",
      danger: "text-danger",
    },
  },
  defaultVariants: {
    tone: "safe",
  },
});

export const styles = {
  container: pageLayout.pageContainer,
  sectionCard: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
  headlineMuted: "text-sm text-text-muted",
  emptyState: "text-center p-12",
  controlsGrid: forecastPanelStyles.controlsGrid,
  controlGroup: forecastPanelStyles.controlGroup,
  label: forecastPanelStyles.label,
  inputWidth: "w-[14ch]",
  inputAdornment: "flex items-center gap-2",
  adornmentText: "text-sm text-text-muted",
  helperText: "text-xs text-text-muted",
  warning:
    "flex items-center gap-2 text-sm text-text-muted border border-border rounded-md p-3 bg-bg-elevated",
  warningIcon: "w-4 h-4 text-text-dim",
} as const;

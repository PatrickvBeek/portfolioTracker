import { positionFirstCol } from "./positionLayout.styles";

export const styles = {
  bar: "bg-bg-elevated rounded grid grid-cols-2 gap-x-6 gap-y-1 px-4 py-2 sm:flex sm:flex-row sm:items-center",
  firstCol: positionFirstCol,
  metric: "flex flex-col sm:flex-1",
  label: "text-text-muted text-xs",
  value: "text-text font-mono text-sm",
} as const;

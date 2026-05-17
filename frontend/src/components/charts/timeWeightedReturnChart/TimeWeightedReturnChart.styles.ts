import { pageLayout } from "../../ui/page-layout.styles";

export const styles = {
  container: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
  benchmarkSelect: "w-48",
  controls: "flex items-center gap-3 flex-wrap",
  header: "flex items-center justify-between flex-wrap gap-2 mb-4",
} as const;

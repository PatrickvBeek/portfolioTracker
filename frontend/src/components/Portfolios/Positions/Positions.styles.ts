import { pageLayout } from "../../ui/page-layout.styles";

export const styles = {
  container: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
  tabContent: "pt-4",
  cardGrid: "grid grid-cols-1 gap-4",
  emptyState: "text-center py-12 text-text-muted",
  emptyStatePrimary: "text-sm",
} as const;

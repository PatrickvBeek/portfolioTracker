import { pageLayout } from "../ui/page-layout.styles";

export const styles = {
  pageWrapper: pageLayout.pageContainer,
  iconBadge: "p-2 rounded-lg bg-accent-soft",
  headerRow: "flex items-center gap-3 mb-2",
  contentBody: pageLayout.sectionStack,
  sectionCard: pageLayout.sectionCard,
  sectionBody: pageLayout.sectionBody,
} as const;

import { pageLayout } from "../ui/page-layout.styles";

export const styles = {
  pageWrapper: pageLayout.pageContainer,
  iconBadge: "p-2 rounded-lg bg-accent-soft",
  header: "mb-8",
  headerRow: "flex items-center gap-3 mb-2",
  contentCard:
    "rounded-xl border border-border bg-bg-card shadow-lg p-4 md:p-6",
  contentBody: pageLayout.sectionStack,
  formSection: "p-4 md:p-5 rounded-lg border border-border bg-bg-elevated",
} as const;

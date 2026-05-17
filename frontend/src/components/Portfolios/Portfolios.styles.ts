import { pageLayout } from "../ui/page-layout.styles";

export const styles = {
  container: "w-full max-w-content mx-auto",
  header: "mb-6",
  main: "flex gap-12",
  content: `flex-1 min-w-0 ${pageLayout.sectionStack}`,
  formSidebar: "hidden lg:block w-60 shrink-0 sticky top-20 h-fit",
  sheetTrigger:
    "lg:hidden fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg p-0 flex items-center justify-center",
} as const;

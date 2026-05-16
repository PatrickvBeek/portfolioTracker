export const styles = {
  container: "w-full",
  header: "mb-6",
  main: "flex gap-8",
  content: "flex-1 min-w-0 flex flex-col gap-8",
  formSidebar: "hidden lg:block w-60 shrink-0 sticky top-6 h-fit",
  sheetTrigger:
    "lg:hidden fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg p-0 flex items-center justify-center",
} as const;

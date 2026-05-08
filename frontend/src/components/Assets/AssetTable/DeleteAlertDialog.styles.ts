export const styles = {
  overlay:
    "fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow",
  content:
    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-card rounded-lg shadow-2xl border border-border p-6 focus:outline-none data-[state=open]:animate-contentShow",
  title: "text-lg font-semibold text-text mb-2",
  description: "text-text-muted mb-6",
  buttonRow: "flex justify-end gap-3",
} as const;

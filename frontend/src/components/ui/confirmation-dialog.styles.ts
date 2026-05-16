import { cn } from "../../utility/cn";
import { dialogStyles } from "./dialog.styles";

export const styles = {
  overlay: dialogStyles.overlay,
  content: cn(dialogStyles.content, "max-w-md"),
  title: cn(dialogStyles.title, "mb-2"),
  description: "text-text-muted mb-6",
  buttonRow: "flex justify-end gap-3",
} as const;

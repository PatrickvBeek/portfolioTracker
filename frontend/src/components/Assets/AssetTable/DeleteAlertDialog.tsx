import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "../../../utility/cn";

type DeleteAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  body: string;
};

export function DeleteAlertDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  body,
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md",
            "bg-bg-card rounded-lg shadow-2xl border border-border",
            "p-6 focus:outline-none data-[state=open]:animate-contentShow"
          )}
        >
          <AlertDialog.Title className="text-lg font-semibold text-text mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-text-muted mb-6">
            {body}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  "bg-transparent border border-border text-text-muted",
                  "hover:bg-bg-elevated hover:text-text",
                  "focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-card",
                  "transition-colors duration-150"
                )}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  "bg-danger text-white",
                  "hover:bg-danger-hover",
                  "focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-bg-card",
                  "transition-colors duration-150"
                )}
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

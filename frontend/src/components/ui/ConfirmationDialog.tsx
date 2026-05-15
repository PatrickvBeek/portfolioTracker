import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useRef, type ReactNode } from "react";
import { Button } from "./Button";
import { styles } from "./confirmation-dialog.styles";

type ConfirmIntent = "primary" | "ghost" | "danger" | "danger-ghost";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmIntent?: ConfirmIntent;
};

export function ConfirmationDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmIntent = "ghost",
}: ConfirmationDialogProps) {
  const cancelIntent = confirmIntent === "primary" ? "ghost" : "primary";
  const isConfirming = useRef(false);

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          return;
        }
        if (isConfirming.current) {
          isConfirming.current = false;
          return;
        }
        onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.overlay} />
        <AlertDialog.Content className={styles.content}>
          <AlertDialog.Title className={styles.title}>
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description asChild className={styles.description}>
            <div>{body}</div>
          </AlertDialog.Description>
          <div className={styles.buttonRow}>
            <AlertDialog.Cancel asChild>
              <Button intent={cancelIntent}>{cancelLabel}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                intent={confirmIntent}
                onClick={() => {
                  isConfirming.current = true;
                  onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { styles } from "./DeleteAlertDialog.styles";
import { Button } from "../../ui/Button";

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
        <AlertDialog.Overlay className={styles.overlay} />
        <AlertDialog.Content className={styles.content}>
          <AlertDialog.Title className={styles.title}>
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            {body}
          </AlertDialog.Description>
          <div className={styles.buttonRow}>
            <AlertDialog.Cancel asChild>
              <Button intent="ghost">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button intent="danger" onClick={onConfirm}>
                Delete
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

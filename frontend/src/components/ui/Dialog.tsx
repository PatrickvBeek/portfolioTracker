import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../utility/cn";
import { styles } from "./dialog.styles";

type DialogProps = ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, title, children, className, ...props }, ref) => {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className={styles.overlay} />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(styles.content, className)}
            onPointerDownOutside={() => onOpenChange(false)}
            onInteractOutside={() => onOpenChange(false)}
            {...props}
          >
            <DialogPrimitive.Title className={styles.title}>
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className={styles.closeButton}
              aria-label="Close"
            >
              <X size={16} />
            </DialogPrimitive.Close>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);

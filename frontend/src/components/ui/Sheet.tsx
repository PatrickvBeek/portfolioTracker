import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { forwardRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../utility/cn";
import { sheetStyles } from "./sheet.styles";

type SheetSide = "right" | "left";

type SheetProps = ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  side?: SheetSide;
  children: ReactNode;
};

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  (
    {
      open,
      onOpenChange,
      title,
      side = "right",
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className={sheetStyles.overlay} />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(sheetStyles.content({ side }), className)}
            onPointerDownOutside={() => onOpenChange(false)}
            onInteractOutside={() => onOpenChange(false)}
            {...props}
          >
            <div className={sheetStyles.header}>
              <DialogPrimitive.Title
                className={title ? sheetStyles.title : undefined}
              >
                {title || <VisuallyHidden.Root>Sheet</VisuallyHidden.Root>}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                className={sheetStyles.closeButton}
                aria-label="Close"
              >
                <X size={16} />
              </DialogPrimitive.Close>
            </div>
            <div className={sheetStyles.body}>{children}</div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);

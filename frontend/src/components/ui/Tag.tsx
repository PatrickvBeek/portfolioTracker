import { ComponentPropsWithRef, forwardRef, ReactNode } from "react";
import { cn } from "../../utility/cn";
import { tagVariants } from "./tag.styles";

type TagProps = ComponentPropsWithRef<"button"> & {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ selected, onClick, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-selected={selected}
        onClick={onClick}
        className={cn(tagVariants({ selected }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

import { ComponentPropsWithRef, forwardRef } from "react";
import { cn } from "../../utility/cn";
import { toggleGroupVariants, toggleItemVariants } from "./toggle-group.styles";

type ToggleGroupProps = ComponentPropsWithRef<"div">;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(toggleGroupVariants(), className)}
        {...props}
      />
    );
  }
);

interface ToggleItemProps<T extends string> extends Omit<
  ComponentPropsWithRef<"button">,
  "onClick" | "onSelect"
> {
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
}

export function ToggleItem<T extends string>({
  value,
  selected,
  onSelect,
  className,
  children,
  ...props
}: ToggleItemProps<T>) {
  const handleClick = () => {
    onSelect(value);
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={handleClick}
      className={cn(toggleItemVariants({ selected }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

ToggleItem.displayName = "ToggleItem";

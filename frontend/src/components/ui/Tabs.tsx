import { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utility/cn";
import { styles } from "./tabs.styles";

type TabEntry = string | { value: string; label?: string; content?: ReactNode };

interface TabsProps {
  entries: TabEntry[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  contentClassName?: string;
}

function toEntry(entry: TabEntry): { value: string; label: string } {
  return typeof entry === "string"
    ? { value: entry, label: entry }
    : { value: entry.value, label: entry.label ?? entry.value };
}

export function Tabs({
  entries,
  value,
  onValueChange,
  className,
  contentClassName,
}: TabsProps) {
  const hasContent = entries.some(
    (entry) => typeof entry !== "string" && entry.content
  );

  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      <TabsPrimitive.List className={cn(styles.list, className)}>
        {entries.map((entry) => {
          const { value: tabValue, label } = toEntry(entry);
          return (
            <TabsPrimitive.Trigger
              key={tabValue}
              value={tabValue}
              className={styles.trigger}
            >
              {label}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
      {hasContent &&
        entries.map((entry) => {
          if (typeof entry === "string" || !entry.content) {
            return null;
          }
          return (
            <TabsPrimitive.Content
              key={entry.value}
              value={entry.value}
              className={contentClassName}
            >
              {entry.content}
            </TabsPrimitive.Content>
          );
        })}
    </TabsPrimitive.Root>
  );
}

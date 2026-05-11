import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utility/cn";
import { styles } from "./tabs.styles";

interface TabsProps {
  entries: string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Tabs({ entries, value, onValueChange, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      <TabsPrimitive.List className={cn(styles.list, className)}>
        {entries.map((entry) => (
          <TabsPrimitive.Trigger
            key={entry}
            value={entry}
            className={styles.trigger}
          >
            {entry}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

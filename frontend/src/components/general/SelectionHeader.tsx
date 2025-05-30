import { Tab, Tabs } from "@mui/material";

type SelectionHeaderProps<T> = {
  entries: string[];
  selectedEntry: string;
  setSelectedEntry: (e: T) => void;
  descriptor?: string;
};

const SelectionHeader = <T extends string>({
  entries,
  selectedEntry,
  setSelectedEntry,
}: SelectionHeaderProps<T>) => {
  return (
    <Tabs
      value={selectedEntry}
      onChange={(_, newValue) => {
        setSelectedEntry(newValue);
      }}
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
    >
      {entries.map((entry) => (
        <Tab key={entry} label={entry} value={entry} />
      ))}
    </Tabs>
  );
};

export default SelectionHeader;

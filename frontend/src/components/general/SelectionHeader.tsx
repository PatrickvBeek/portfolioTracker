import { Tab, Tabs } from "@mui/material";
import React from "react";

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
  const handleChange = (_: React.SyntheticEvent, newValue: T) => {
    setSelectedEntry(newValue);
  };

  return (
    <Tabs
      value={selectedEntry}
      onChange={handleChange}
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

import { FC } from "react";
import { ToggleGroup, ToggleItem } from "../ui/ToggleGroup";
import { ChartRange, CHART_RANGES } from "./chartRange.types";

interface ChartRangeSelectorProps {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

export const ChartRangeSelector: FC<ChartRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleSelect = (range: ChartRange) => {
    onChange(range);
  };

  return (
    <ToggleGroup aria-label="time range">
      {Object.values(CHART_RANGES).map((r) => (
        <ToggleItem
          key={r}
          value={r}
          selected={value === r}
          onSelect={handleSelect}
          aria-label={r}
        >
          {r}
        </ToggleItem>
      ))}
    </ToggleGroup>
  );
};

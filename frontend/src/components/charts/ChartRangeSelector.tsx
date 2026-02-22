import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FC } from "react";
import { ChartRange, CHART_RANGES } from "./chartRange.types";

export interface ChartRangeSelectorProps {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

export const ChartRangeSelector: FC<ChartRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRange: ChartRange | null
  ) => {
    if (newRange !== null) {
      onChange(newRange);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="time range"
      size="small"
      color="primary"
    >
      {Object.values(CHART_RANGES).map((r) => (
        <ToggleButton key={r} value={r} aria-label={r}>
          {r}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

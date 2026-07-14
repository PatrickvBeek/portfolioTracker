import { FC } from "react";
import { ToggleGroup, ToggleItem } from "../../ui/ToggleGroup";
import { TwrMode } from "./TimeWeightedReturnChart.logic";

interface TwrModeSelectorProps {
  value: TwrMode;
  onChange: (mode: TwrMode) => void;
}

export const TwrModeSelector: FC<TwrModeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleSelect = (mode: TwrMode) => {
    onChange(mode);
  };

  return (
    <ToggleGroup aria-label="twr mode">
      <ToggleItem
        value="nominal"
        selected={value === "nominal"}
        onSelect={handleSelect}
        aria-label="nominal"
      >
        Nominal
      </ToggleItem>
      <ToggleItem
        value="real"
        selected={value === "real"}
        onSelect={handleSelect}
        aria-label="real"
      >
        Real
      </ToggleItem>
    </ToggleGroup>
  );
};

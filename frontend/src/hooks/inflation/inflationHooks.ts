import { generateConstantRateInflationIndex, History } from "pt-domain";
import { useMemo } from "react";

const DEFAULT_ANNUAL_RATE = 0.02;

export const useInflationIndex = (
  startDate: number | undefined
): History<number> => {
  return useMemo(() => {
    if (startDate === undefined) {
      return [];
    }

    return generateConstantRateInflationIndex(
      startDate,
      Date.now(),
      DEFAULT_ANNUAL_RATE
    );
  }, [startDate]);
};

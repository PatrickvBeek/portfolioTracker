import { useQuery } from "@tanstack/react-query";
import {
  generateConstantRateInflationIndex,
  History,
  mergeWithConstantRateTail,
} from "pt-domain";
import { useMemo } from "react";
import { CustomQuery } from "../prices/priceHooks";
import { fetchDestatisCpiIndex } from "./destatisAdapter";

const DEFAULT_ANNUAL_RATE = 0.02;
const INFLATION_QUERY_KEY = ["inflation", "destatis", "61111-0002"] as const;

export const useInflationIndex = (
  startDate: number | undefined
): CustomQuery<History<number>> => {
  const query = useQuery({
    queryKey: INFLATION_QUERY_KEY,
    queryFn: fetchDestatisCpiIndex,
    staleTime: Infinity,
    retry: false,
  });

  const data = useMemo(() => {
    if (startDate === undefined) {
      return [];
    }

    const now = Date.now();

    if (query.data && query.data.length > 0) {
      return mergeWithConstantRateTail(
        query.data,
        startDate,
        now,
        DEFAULT_ANNUAL_RATE
      );
    }

    return generateConstantRateInflationIndex(
      startDate,
      now,
      DEFAULT_ANNUAL_RATE
    );
  }, [startDate, query.data]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data,
  };
};

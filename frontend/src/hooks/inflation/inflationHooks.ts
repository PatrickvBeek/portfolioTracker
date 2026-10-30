import { useQuery } from "@tanstack/react-query";
import {
  generateConstantRateInflationIndex,
  History,
  mergeWithConstantRateTail,
} from "pt-domain";
import { useMemo, useState } from "react";
import { CustomQuery } from "../prices/priceHooks";
import { fetchDestatisCpiIndex } from "./destatisAdapter";

export const DEFAULT_INFLATION_RATE = 0.02;
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

  const [now] = useState(() => Date.now());

  const data = useMemo(() => {
    if (startDate === undefined) {
      return [];
    }

    if (query.data && query.data.length > 0) {
      return mergeWithConstantRateTail(
        query.data,
        startDate,
        now,
        DEFAULT_INFLATION_RATE
      );
    }

    return generateConstantRateInflationIndex(
      startDate,
      now,
      DEFAULT_INFLATION_RATE
    );
  }, [startDate, query.data, now]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data,
  };
};

import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(
  value: T,
  delayMs: number
): { value: T; isPending: boolean } => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  const [isPending, setIsPending] = useState(false);

  if (!Object.is(seenValue, value)) {
    setSeenValue(value);
    setIsPending(true);
  }

  useEffect(() => {
    if (!isPending) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [isPending, value, delayMs]);

  return { value: debouncedValue, isPending };
};

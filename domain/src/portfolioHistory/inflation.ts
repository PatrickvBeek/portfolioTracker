import { pickValueFromHistory } from "./history.derivers";
import { History } from "./history.entities";

const firstOfMonth = (ts: number): number => {
  const d = new Date(ts);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

const addMonths = (ts: number, months: number): number => {
  const d = new Date(ts);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

const monthlyTimestamps = function* (
  start: number,
  end: number
): Generator<number> {
  let current = firstOfMonth(start);
  while (current <= end) {
    yield current;
    current = addMonths(current, 1);
  }
};

const compoundFromAnchor = (
  anchorTs: number,
  anchorValue: number,
  ts: number,
  annualRate: number
): number =>
  anchorValue * Math.pow(1 + annualRate, (ts - anchorTs) / MS_PER_YEAR);

/**
 * Merges a real (normalized) inflation index with a constant-rate compound
 * tail so that the result covers `[firstOfMonth(startDate), endDate]`.
 *
 * - Real points are emitted as-is for the months they cover; real points
 *   before `firstOfMonth(startDate)` or after `endDate` are dropped. The
 *   input need not be sorted — points in range are sorted chronologically
 *   before forward-filling and tail-anchoring.
 * - Internal gaps between real points are forward-filled from the last known
 *   real value (step-function semantics, consistent with pickValueFromHistory).
 * - After the last real point, the index compounds monthly at `annualRate`,
 *   anchored to the last real value.
 *   This guarantees continuity at the seam — the tail continues smoothly from
 *   the last real value rather than resetting.
 * - If `realIndex` is empty, or no real point falls in
 *   `[firstOfMonth(startDate), endDate]`, the result equals
 *   `generateConstantRateInflationIndex(startDate, endDate, annualRate)`.
 *   (`deflateByIndex` self-normalizes to the index's first value, so an
 *   anchored tail starting above 1.0 would add no observable correctness at
 *   any consumer — a full constant-rate fallback is simpler and equivalent.)
 * - Returns `[]` when `startDate >= endDate`.
 */
export const mergeWithConstantRateTail = (
  realIndex: History<number>,
  startDate: number,
  endDate: number,
  annualRate: number = 0.02
): History<number> => {
  if (startDate >= endDate) {
    return [];
  }

  const rangeStart = firstOfMonth(startDate);
  const realPointsInRange = realIndex
    .filter((p) => p.timestamp >= rangeStart && p.timestamp <= endDate)
    .toSorted((a, b) => a.timestamp - b.timestamp);

  // No usable real CPI data overlapping [rangeStart, endDate] → full-range
  // constant-rate fallback. `deflateByIndex` self-normalizes to the index's
  // first value, so anchoring to a last-real-point before `rangeStart` would
  // add no observable correctness at any consumer.
  if (realPointsInRange.length === 0) {
    return generateConstantRateInflationIndex(startDate, endDate, annualRate);
  }

  const anchor = {
    ts: firstOfMonth(realPointsInRange[realPointsInRange.length - 1].timestamp),
    value: realPointsInRange[realPointsInRange.length - 1].value,
  };

  const points: History<number> = [];

  // Phase A: real points, forward-filled month-by-month up to the anchor.
  let lastKnownValue = realPointsInRange[0].value;
  let realIdx = 0;
  for (const ts of monthlyTimestamps(rangeStart, anchor.ts)) {
    const realPoint = realPointsInRange[realIdx];
    if (realPoint && firstOfMonth(realPoint.timestamp) === ts) {
      lastKnownValue = realPoint.value;
      realIdx++;
    }
    points.push({ timestamp: ts, value: lastKnownValue });
  }

  // Phase B: compounded tail from the anchor to endDate.
  const tailStart = Math.max(addMonths(anchor.ts, 1), rangeStart);
  for (const ts of monthlyTimestamps(tailStart, endDate)) {
    points.push({
      timestamp: ts,
      value: compoundFromAnchor(anchor.ts, anchor.value, ts, annualRate),
    });
  }

  return points;
};

export const generateConstantRateInflationIndex = (
  startDate: number,
  endDate: number,
  annualRate: number
): History<number> => {
  if (startDate >= endDate) {
    return [];
  }

  const baseTimestamp = firstOfMonth(startDate);
  return [...monthlyTimestamps(startDate, endDate)].map((ts) => ({
    timestamp: ts,
    value: compoundFromAnchor(baseTimestamp, 1, ts, annualRate),
  }));
};

export const deflateByIndex = (
  marketValueHistory: History<number>,
  inflationIndex: History<number>
): History<number> => {
  if (marketValueHistory.length === 0 || inflationIndex.length === 0) {
    return [];
  }

  const baseIndex = inflationIndex[0].value;

  return marketValueHistory.map((point) => {
    const indexAtT = pickValueFromHistory(inflationIndex, point.timestamp);
    const inflationFactor = indexAtT ? baseIndex / indexAtT.value : 1;

    return {
      timestamp: point.timestamp,
      value: point.value * inflationFactor,
    };
  });
};

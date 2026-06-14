import { pickValueFromHistory } from "./history.derivers";
import { History } from "./history.entities";

const firstOfMonth = (ts: number): number => {
  const d = new Date(ts);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
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
  const points: History<number> = [];
  let current = baseTimestamp;

  while (current <= endDate) {
    const yearsElapsed =
      (current - baseTimestamp) / (1000 * 60 * 60 * 24 * 365.25);
    points.push({
      timestamp: current,
      value: Math.pow(1 + annualRate, yearsElapsed),
    });
    const date = new Date(current);
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    date.setUTCHours(0, 0, 0, 0);
    current = date.getTime();
  }

  return points;
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

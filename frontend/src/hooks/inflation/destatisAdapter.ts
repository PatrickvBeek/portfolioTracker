import { History } from "pt-domain";

const DESTATIS_CPI_TABLE_URL =
  "https://genesis.destatis.de/genesis/api/rest/tables/61111-0002/data";

const QMU_CONTENT_CODE = "PREIS1$QMU";
const MONTH_PREFIX = "MONAT";
const MONTHS_IN_YEAR = 12;

/**
 * Subset of the Destatis REST table response shape relevant to CPI parsing.
 *
 * The response is a multi-dimensional table: `data[0].id` lists the dimension
 * names in iteration order (e.g. `["statistic","DINSG","content","MONAT","JAHR"]`),
 * `data[0].size` the cardinality of each dimension, and `data[0].value` is a
 * flat row-major (C-order, last dimension fastest) array of cell values.
 * `data[0].dimension.<name>.category.index` maps each category code to its
 * position within that dimension.
 *
 * For table 61111-0002 the `content` dimension exposes `PREIS1$QMU` (the
 * absolute CPI index levels, base 2020=100) alongside two rate-of-change
 * variants; the adapter selects only the QMU variant.
 *
 * Cell values are numbers; sentinel values `0.0` and `-100.0` mark "no data"
 * (e.g. unreleased future months). These are dropped before normalization.
 */
export type DestatisTableResponse = {
  data: Array<{
    id: string[];
    size: number[];
    value: Array<number | string | null>;
    dimension: Record<string, { category: { index: Record<string, number> } }>;
  }>;
};

const isStrictlyPositiveFinite = (
  value: number | string | null
): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const firstOfMonthUtc = (year: number, month: number): number =>
  Date.UTC(year, month, 1);

/**
 * Parses a Destatis table response into a normalized `History<number>` of
 * CPI index levels (base 2020=100), selecting the `PREIS1$QMU` content
 * variant. Sentinel values (non strictly-positive finite) are dropped before
 * normalizing to 1.0 at the chronologically earliest surviving point.
 * Output is sorted ascending with first-of-month UTC timestamps.
 */
export const parseDestatisCpiResponse = (
  response: DestatisTableResponse
): History<number> => {
  const table = response.data?.[0];
  if (!table || !table.id || !table.size || !table.value || !table.dimension) {
    return [];
  }

  const dimensions = table.id;
  const size = table.size;
  const contentIdx = dimensions.indexOf("content");
  const monthIdx = dimensions.indexOf("MONAT");
  const yearIdx = dimensions.indexOf("JAHR");

  if (contentIdx === -1 || monthIdx === -1 || yearIdx === -1) {
    return [];
  }

  const categories = (dimName: string): Record<string, number> =>
    table.dimension[dimName]?.category.index ?? {};

  const qmuContentPosition = categories(dimensions[contentIdx])[
    QMU_CONTENT_CODE
  ];
  if (qmuContentPosition === undefined) {
    return [];
  }

  const monthEntries = Object.entries(categories(dimensions[monthIdx]));
  const yearEntries = Object.entries(categories(dimensions[yearIdx]));

  // Row-major (C-order) linear index into the flat `value` array.
  // Each dimension d contributes position[d] * product(size[d+1..]).
  // Singleton dimensions (statistic, DINSG) sit at position 0 and add nothing.
  const positions = Array.from({ length: dimensions.length }, () => 0);
  positions[contentIdx] = qmuContentPosition;

  const points: History<number> = [];

  for (const [yearCode, yearPos] of yearEntries) {
    const year = parseInt(yearCode, 10);
    if (!Number.isFinite(year)) {
      continue;
    }
    positions[yearIdx] = yearPos;
    for (const [monthCode, monthPos] of monthEntries) {
      if (!monthCode.startsWith(MONTH_PREFIX)) {
        continue;
      }
      const monthNum = parseInt(monthCode.slice(MONTH_PREFIX.length), 10);
      if (
        !Number.isFinite(monthNum) ||
        monthNum < 1 ||
        monthNum > MONTHS_IN_YEAR
      ) {
        continue;
      }

      positions[monthIdx] = monthPos;
      const linearIndex = positions.reduce(
        (idx, pos, d) => idx * size[d] + pos,
        0
      );

      const rawValue = table.value[linearIndex];
      if (!isStrictlyPositiveFinite(rawValue)) {
        continue;
      }

      points.push({
        timestamp: firstOfMonthUtc(year, monthNum - 1),
        value: rawValue,
      });
    }
  }

  if (points.length === 0) {
    return [];
  }

  const sorted = points.toSorted((a, b) => a.timestamp - b.timestamp);

  const earliestValue = sorted[0].value;
  return sorted.map((p) => ({
    timestamp: p.timestamp,
    value: p.value / earliestValue,
  }));
};

/**
 * Fetches the Destatis CPI table (61111-0002, content `PREIS1$QMU`) and
 * parses it into a normalized `History<number>`. Thin wrapper around
 * `fetch` + `parseDestatisCpiResponse`.
 */
export const fetchDestatisCpiIndex = async (): Promise<History<number>> => {
  const response = await fetch(
    `${DESTATIS_CPI_TABLE_URL}?content=${QMU_CONTENT_CODE}`
  );
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion external API response shape assumed
  const json = (await response.json()) as DestatisTableResponse;
  return parseDestatisCpiResponse(json);
};

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

type DestatisTable = DestatisTableResponse["data"][number];

type DimensionIndices = {
  content: number;
  month: number;
  year: number;
};

const isStrictlyPositiveFinite = (
  value: number | string | null
): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const firstOfMonthUtc = (year: number, month: number): number =>
  Date.UTC(year, month, 1);

const getTable = (
  response: DestatisTableResponse
): DestatisTable | undefined => {
  const table = response.data?.[0];
  if (!table) {
    return undefined;
  }

  const requiredFields = [table.id, table.size, table.value, table.dimension];
  return requiredFields.every(Boolean) ? table : undefined;
};

const getDimensionIndices = (
  dimensionNames: string[]
): DimensionIndices | undefined => {
  const content = dimensionNames.indexOf("content");
  const month = dimensionNames.indexOf(MONTH_PREFIX);
  const year = dimensionNames.indexOf("JAHR");

  if (content === -1 || month === -1 || year === -1) {
    return undefined;
  }

  return { content, month, year };
};

const getCategoryIndex = (
  table: DestatisTable,
  dimensionName: string
): Record<string, number> =>
  table.dimension[dimensionName]?.category.index ?? {};

const parseMonth = (monthCode: string): number | undefined => {
  if (!monthCode.startsWith(MONTH_PREFIX)) {
    return undefined;
  }

  const month = parseInt(monthCode.slice(MONTH_PREFIX.length), 10);
  if (!Number.isFinite(month) || month < 1 || month > MONTHS_IN_YEAR) {
    return undefined;
  }

  return month;
};

const getLinearIndex = (positions: number[], size: number[]): number =>
  positions.reduce((index, position, dimension) => {
    return index * size[dimension] + position;
  }, 0);

// Row-major (C-order) linear index into the flat `value` array.
// Each dimension d contributes position[d] * product(size[d+1..]).
// Singleton dimensions (statistic, DINSG) sit at position 0 and add nothing.
type PointBuildContext = {
  table: DestatisTable;
  indices: DimensionIndices;
  positions: number[];
  monthEntries: [string, number][];
};

const buildPointsForYear = (
  { table, indices, positions, monthEntries }: PointBuildContext,
  year: number,
  yearPosition: number
): History<number> => {
  positions[indices.year] = yearPosition;
  const points: History<number> = [];

  for (const [monthCode, monthPosition] of monthEntries) {
    const month = parseMonth(monthCode);
    if (month === undefined) {
      continue;
    }

    positions[indices.month] = monthPosition;
    const rawValue = table.value[getLinearIndex(positions, table.size)];
    if (!isStrictlyPositiveFinite(rawValue)) {
      continue;
    }

    points.push({
      timestamp: firstOfMonthUtc(year, month - 1),
      value: rawValue,
    });
  }

  return points;
};

const buildPoints = (
  table: DestatisTable,
  indices: DimensionIndices,
  qmuContentPosition: number
): History<number> => {
  const monthEntries = Object.entries(
    getCategoryIndex(table, table.id[indices.month])
  );
  const yearEntries = Object.entries(
    getCategoryIndex(table, table.id[indices.year])
  );

  const positions = Array.from({ length: table.id.length }, () => 0);
  positions[indices.content] = qmuContentPosition;

  const context: PointBuildContext = {
    table,
    indices,
    positions,
    monthEntries,
  };
  const points: History<number> = [];

  for (const [yearCode, yearPosition] of yearEntries) {
    const year = parseInt(yearCode, 10);
    if (!Number.isFinite(year)) {
      continue;
    }

    points.push(...buildPointsForYear(context, year, yearPosition));
  }

  return points;
};

const normalizePoints = (points: History<number>): History<number> => {
  if (points.length === 0) {
    return [];
  }

  const sorted = points.toSorted((a, b) => a.timestamp - b.timestamp);
  const earliestValue = sorted[0].value;
  return sorted.map((point) => ({
    timestamp: point.timestamp,
    value: point.value / earliestValue,
  }));
};

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
  const table = getTable(response);
  if (!table) {
    return [];
  }

  const indices = getDimensionIndices(table.id);
  if (!indices) {
    return [];
  }

  const qmuContentPosition = getCategoryIndex(table, table.id[indices.content])[
    QMU_CONTENT_CODE
  ];
  if (qmuContentPosition === undefined) {
    return [];
  }

  return normalizePoints(buildPoints(table, indices, qmuContentPosition));
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

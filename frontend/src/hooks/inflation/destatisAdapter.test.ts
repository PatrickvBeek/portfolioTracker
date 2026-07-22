import { describe, expect, it } from "vitest";
import {
  parseDestatisCpiResponse,
  type DestatisTableResponse,
} from "./destatisAdapter";

const DEFAULT_MONATE = [
  "MONAT01",
  "MONAT02",
  "MONAT03",
  "MONAT04",
  "MONAT05",
  "MONAT06",
  "MONAT07",
  "MONAT08",
  "MONAT09",
  "MONAT10",
  "MONAT11",
  "MONAT12",
];
const DEFAULT_CONTENT_CODES = ["PREIS1$CH0004", "PREIS1$CH0005", "PREIS1$QMU"];
const QMU_CODE = "PREIS1$QMU";

type CellValue = number | string | null;

type BuildOptions = {
  years: string[];
  months?: string[];
  contentCodes?: string[];
  qmuCode?: string;
  qmuCells: Record<string, CellValue>;
  otherCellValue?: CellValue;
};

const cellKey = (monthCode: string, yearCode: string): string =>
  `${yearCode}-${monthCode}`;

const buildResponse = (options: BuildOptions): DestatisTableResponse => {
  const months = options.months ?? DEFAULT_MONATE;
  const contentCodes = options.contentCodes ?? DEFAULT_CONTENT_CODES;
  const qmuCode = options.qmuCode ?? QMU_CODE;
  const qmuPosition = contentCodes.indexOf(qmuCode);
  const other = options.otherCellValue ?? 0.0;

  const yearsCount = options.years.length;
  const monthsCount = months.length;
  const perContentBlock = monthsCount * yearsCount;
  const total = contentCodes.length * perContentBlock;

  const fullValues: CellValue[] = [];
  for (let c = 0; c < contentCodes.length; c++) {
    for (const monthCode of months) {
      for (const yearCode of options.years) {
        if (c === qmuPosition) {
          fullValues.push(
            options.qmuCells[cellKey(monthCode, yearCode)] ?? 0.0
          );
        } else {
          fullValues.push(other);
        }
      }
    }
  }
  if (fullValues.length !== total) {
    throw new Error(`value array length ${fullValues.length} != ${total}`);
  }

  const contentIndex: Record<string, number> = Object.fromEntries(
    contentCodes.map((code, i) => [code, i])
  );
  const monthIndex: Record<string, number> = Object.fromEntries(
    months.map((code, i) => [code, i])
  );
  const yearIndex: Record<string, number> = Object.fromEntries(
    options.years.map((code, i) => [code, i])
  );

  return {
    data: [
      {
        id: ["statistic", "DINSG", "content", "MONAT", "JAHR"],
        size: [1, 1, contentCodes.length, monthsCount, yearsCount],
        value: fullValues,
        dimension: {
          statistic: { category: { index: { "61111": 0 } } },
          DINSG: { category: { index: { DG: 0 } } },
          content: { category: { index: contentIndex } },
          MONAT: { category: { index: monthIndex } },
          JAHR: { category: { index: yearIndex } },
        },
      },
    ],
  };
};

const monthCode = (month: number) => `MONAT${String(month).padStart(2, "0")}`;

const fillQmuCells = (
  years: string[],
  values: CellValue[]
): Record<string, CellValue> => {
  const cells: Record<string, CellValue> = {};
  let i = 0;
  for (const year of years) {
    for (let m = 1; m <= 12; m++) {
      cells[`${year}-${monthCode(m)}`] = values[i++];
    }
  }
  return cells;
};

describe("parseDestatisCpiResponse", () => {
  describe("content variant selection", () => {
    it("selects only the PREIS1$QMU content variant out of multiple", () => {
      const years = ["2020", "2021"];
      const qmuValues = [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
        114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
      ];

      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(years, qmuValues),
        otherCellValue: 9999,
      });

      const result = parseDestatisCpiResponse(response);

      expect(result.length).toBe(24);
      expect(result[0].value).toBeCloseTo(1, 10);
      expect(result[0].timestamp).toBe(Date.UTC(2020, 0, 1));
      expect(result[1].timestamp).toBe(Date.UTC(2020, 1, 1));
      expect(result[12].timestamp).toBe(Date.UTC(2021, 0, 1));
    });

    it("returns empty when PREIS1$QMU is not present", () => {
      const years = ["2020"];
      const response = buildResponse({
        years,
        qmuCells: {},
        contentCodes: ["PREIS1$CH0004", "PREIS1$CH0005"],
        qmuCode: "PREIS1$QMU",
      });

      expect(parseDestatisCpiResponse(response)).toEqual([]);
    });
  });

  describe("sentinel filtering", () => {
    it("drops 0.0, -100.0, null, and NaN values before normalization", () => {
      const years = ["2020", "2021"];
      const qmuValues: CellValue[] = [
        100,
        101,
        0.0,
        103,
        -100.0,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        null,
        NaN,
        "115",
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
      ];

      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(years, qmuValues),
      });

      const result = parseDestatisCpiResponse(response);

      const survivingTimestamps = result.map((p) => p.timestamp);
      expect(survivingTimestamps).not.toContain(Date.UTC(2020, 2, 1));
      expect(survivingTimestamps).not.toContain(Date.UTC(2020, 4, 1));
      expect(survivingTimestamps).not.toContain(Date.UTC(2021, 1, 1));
      expect(survivingTimestamps).not.toContain(Date.UTC(2021, 2, 1));
      expect(survivingTimestamps).not.toContain(Date.UTC(2021, 3, 1));

      expect(result[0].value).toBeCloseTo(1, 10);
      expect(result[0].timestamp).toBe(Date.UTC(2020, 0, 1));
    });

    it("normalizes to the earliest surviving value, not the raw earliest cell", () => {
      const years = ["2020"];
      const qmuValues: CellValue[] = [
        0.0, -100.0, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
      ];

      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(years, qmuValues),
      });

      const result = parseDestatisCpiResponse(response);

      expect(result[0].value).toBeCloseTo(1, 10);
      expect(result[0].timestamp).toBe(Date.UTC(2020, 2, 1));
      expect(result[1].value).toBeCloseTo(1.01, 10);
    });
  });

  describe("output ordering and timestamps", () => {
    it("returns points sorted ascending by timestamp", () => {
      const years = ["2022", "2020", "2021"];
      const qmuValues = [
        130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 100, 101,
        102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 118, 119, 120, 121,
        122, 123, 124, 125, 126, 127, 128, 129,
      ];

      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(years, qmuValues),
      });

      const result = parseDestatisCpiResponse(response);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].timestamp).toBeGreaterThan(result[i - 1].timestamp);
      }
      expect(result[0].timestamp).toBe(Date.UTC(2020, 0, 1));
    });

    it("uses first-of-month UTC midnight timestamps", () => {
      const years = ["2020"];
      const qmuValues = [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
      ];

      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(years, qmuValues),
      });

      const result = parseDestatisCpiResponse(response);

      expect(result[0].timestamp).toBe(Date.UTC(2020, 0, 1));
      expect(result[1].timestamp).toBe(Date.UTC(2020, 1, 1));
      expect(result[5].timestamp).toBe(Date.UTC(2020, 5, 1));
      expect(result[11].timestamp).toBe(Date.UTC(2020, 11, 1));
      for (const point of result) {
        const d = new Date(point.timestamp);
        expect(d.getUTCDate()).toBe(1);
        expect(d.getUTCHours()).toBe(0);
        expect(d.getUTCMinutes()).toBe(0);
        expect(d.getUTCSeconds()).toBe(0);
      }
    });
  });

  describe("edge cases", () => {
    it("returns empty for a malformed response without data", () => {
      expect(parseDestatisCpiResponse({ data: [] })).toEqual([]);
    });

    it("returns empty when all values are sentinels", () => {
      const years = ["2020"];
      const response = buildResponse({
        years,
        qmuCells: fillQmuCells(
          years,
          Array.from({ length: 12 }, () => 0.0)
        ),
      });

      expect(parseDestatisCpiResponse(response)).toEqual([]);
    });
  });
});

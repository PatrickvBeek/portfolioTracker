import { HttpResponse, RequestHandler, http } from "msw";
import { setupServer } from "msw/node";
import { sort } from "radash";
import { DestatisTableResponse } from "../hooks/inflation/destatisAdapter";
import { AlphaVantageDailyResult } from "../hooks/prices/alphaVantage";

type MockBackendData = {
  prices: Record<string, AlphaVantageDailyResult>;
  destatis?: DestatisTableResponse | null;
};

function getHandlers(mockData: MockBackendData): RequestHandler[] {
  return [
    http.get("https://www.alphavantage.co/*", ({ request }) => {
      const url = new URL(request.url);
      const symbol = url.searchParams.get("symbol");
      if (!symbol) {
        return new HttpResponse(null, { status: 404 });
      }
      return HttpResponse.json(mockData?.prices[symbol]);
    }),
    http.get(
      "https://genesis.destatis.de/genesis/api/rest/tables/61111-0002/data",
      () => {
        if (mockData?.destatis === null) {
          return new HttpResponse(null, { status: 500 });
        }
        return HttpResponse.json(mockData?.destatis ?? { data: [] });
      }
    ),
  ];
}

export function mockNetwork(backendData: MockBackendData) {
  const server = setupServer(...getHandlers(backendData));

  beforeAll(() => server.listen());
  beforeEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  return {
    setBackendData: (newData: MockBackendData) =>
      server.resetHandlers(...getHandlers(newData)),
  };
}

export const getPriceResponse = (
  symbol: string,
  dailyPrices: [Date, number][]
) => ({
  [symbol]: {
    "Weekly Time Series": Object.fromEntries(
      sort(dailyPrices, ([date]) => date.getTime(), true).map(
        ([date, price]) => [date, getDailyPriceResponse(price)]
      )
    ),
  },
});

const getDailyPriceResponse = (
  price: number
): AlphaVantageDailyResult["Weekly Time Series"][string] => {
  return {
    "1. open": price.toString(),
    "2. high": price.toString(),
    "3. low": price.toString(),
    "4. close": price.toString(),
    "5. volume": price.toString(),
  };
};

const DESTATIS_MONTH_CODES = [
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

const DESTATIS_CONTENT_CODES = ["PREIS1$CH0004", "PREIS1$CH0005", "PREIS1$QMU"];

type DestatisCell = number | string | null;

export type DestatisCpiFixtures = Record<number, Record<number, DestatisCell>>;

export const getDestatisResponse = (
  fixtures: DestatisCpiFixtures
): DestatisTableResponse => {
  const years = Object.keys(fixtures)
    .map(Number)
    .filter((y) => Number.isFinite(y))
    .toSorted((a, b) => a - b);

  const value: DestatisCell[] = [];
  for (let c = 0; c < DESTATIS_CONTENT_CODES.length; c++) {
    for (const monatCode of DESTATIS_MONTH_CODES) {
      const month = parseInt(monatCode.slice("MONAT".length), 10);
      for (const year of years) {
        const cell = fixtures[year]?.[month];
        value.push(cell === undefined ? 0.0 : cell);
      }
    }
  }

  const monatIndex = Object.fromEntries(
    DESTATIS_MONTH_CODES.map((code, i) => [code, i])
  );
  const jahrIndex = Object.fromEntries(
    years.map((year, i) => [String(year), i])
  );
  const contentIndex = Object.fromEntries(
    DESTATIS_CONTENT_CODES.map((code, i) => [code, i])
  );

  return {
    data: [
      {
        id: ["statistic", "DINSG", "content", "MONAT", "JAHR"],
        size: [
          1,
          1,
          DESTATIS_CONTENT_CODES.length,
          DESTATIS_MONTH_CODES.length,
          years.length,
        ],
        value,
        dimension: {
          statistic: { category: { index: { "61111": 0 } } },
          DINSG: { category: { index: { DG: 0 } } },
          content: { category: { index: contentIndex } },
          MONAT: { category: { index: monatIndex } },
          JAHR: { category: { index: jahrIndex } },
        },
      },
    ],
  };
};

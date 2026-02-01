import { HttpResponse, RequestHandler, http } from "msw";
import { setupServer } from "msw/node";
import { sort } from "radash";
import { AlphaVantageDailyResult } from "../hooks/prices/alphaVantage";

type MockBackendData = {
  prices: Record<string, AlphaVantageDailyResult>;
};

function getHandlers(mockData: MockBackendData | undefined): RequestHandler[] {
  return [
    http.get("https://www.alphavantage.co/*", ({ request }) => {
      const url = new URL(request.url);
      const symbol = url.searchParams.get("symbol");
      if (!symbol) {
        return new HttpResponse(null, { status: 404 });
      }
      return HttpResponse.json(mockData?.prices[symbol]);
    }),
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

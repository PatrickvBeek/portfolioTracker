import { HttpResponse, RequestHandler, http } from "msw";
import { setupServer } from "msw/node";
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

  return server;
}

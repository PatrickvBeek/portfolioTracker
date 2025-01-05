import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { AssetLibrary } from "pt-domain/src/asset/asset.entities";
import { PortfolioLibrary } from "pt-domain/src/portfolio/portfolio.entities";

type MockBackendData = {
  portfolioLib?: PortfolioLibrary;
  assetLib?: AssetLibrary;
};

function getHandlers(mockData: MockBackendData | undefined) {
  return [
    http.get("/api/portfolios", () => {
      return HttpResponse.json(mockData?.portfolioLib || {});
    }),
    http.get("/api/assets", () => {
      return HttpResponse.json(mockData?.assetLib || {});
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

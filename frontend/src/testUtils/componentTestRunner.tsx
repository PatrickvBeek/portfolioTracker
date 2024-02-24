import { render } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AssetLibrary } from "../domain/asset/asset.entities";
import { PortfolioLibrary } from "../domain/portfolio/portfolio.entities";
import { queryClientConfig } from "../queryClient/config";

type MockBackendData = {
  portfolioLib?: PortfolioLibrary;
  assetLib?: AssetLibrary;
};

type ComponentTestArgs = {
  element: ReactElement;
  mockData?: MockBackendData;
};

type ComponentTest = {
  server: ReturnType<typeof setupServer>;
  render: () => void;
};

function getHandlers(mockData: MockBackendData | undefined) {
  return [
    http.get("/api/portfolios/get-portfolios", () => {
      return HttpResponse.json(mockData?.portfolioLib || {});
    }),
    http.get("/api/assets/get-assets", () => {
      return HttpResponse.json(mockData?.assetLib || {});
    }),
  ];
}

export function getComponentTest(args: ComponentTestArgs): ComponentTest {
  const server = setupServer(...getHandlers(args.mockData));
  const queryClient = new QueryClient(queryClientConfig);
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        {args.element}
      </QueryClientProvider>
    );
  };

  return { server, render: renderComponent };
}

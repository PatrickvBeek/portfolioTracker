import { useMutation, useQuery, useQueryClient } from "react-query";
import { Order } from "../../domain/order/order.entities";
import {
  Portfolio,
  PortfolioLibrary,
} from "../../domain/portfolio/portfolio.entities";
import {
  addOrderToPortfolio,
  addPortfolioToLibrary,
  deletePortfolioFromLibrary,
} from "../../domain/portfolio/portfolio.operations";

export function useGetPortfolios() {
  return useQuery("portfolios", fetchPortfolios);
}

export function useAddPortfolio() {
  return useUpdatePortfolios(addPortfolioToLibrary);
}

export function useDeletePortfolio() {
  return useUpdatePortfolios(deletePortfolioFromLibrary);
}

function useUpdatePortfolios<T extends PortfolioUpdate>(
  updater: PortfolioUpdater<T>
) {
  const queryClient = useQueryClient();
  const previousLibrary =
    queryClient.getQueryData<PortfolioLibrary>("portfolios") || {};
  return useMutation(
    (update: T) => {
      return savePortfoliosOnServer(updater(previousLibrary, update));
    },
    {
      onSuccess: (data, update) => {
        queryClient.invalidateQueries("portfolios");
        queryClient.setQueriesData(
          "portfolios",
          updater(previousLibrary, update)
        );
      },
    }
  );
}

export function useAddOrderToPortfolio(portfolio: string) {
  const addOrder: (
    library: PortfolioLibrary,
    order: Order
  ) => PortfolioLibrary = (lib, order) => {
    if (!lib[portfolio]) {
      console.error(
        "portfolio with name",
        portfolio,
        "unexpectedly not found in library:",
        JSON.stringify(lib, null, 4)
      );
      return lib;
    }
    const newPortfolio = addOrderToPortfolio(lib[portfolio], order);
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(addOrder);
}

const fetchPortfolios = async (): Promise<Record<string, Portfolio>> => {
  const response = await fetch("/portfolios/get-portfolios/");
  return response.json();
};

const savePortfoliosOnServer = async (portfolioLib: PortfolioLibrary) => {
  return fetch("/portfolios/save-portfolios", {
    method: "PUT",
    body: JSON.stringify(portfolioLib),
    headers: { "Content-Type": "application/json" },
  });
};

type PortfolioUpdate = Portfolio | Order;

type PortfolioUpdater<T extends PortfolioUpdate> = (
  lib: PortfolioLibrary,
  update: T
) => PortfolioLibrary;

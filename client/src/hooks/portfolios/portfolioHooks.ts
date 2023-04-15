import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  addOrderToPortfolio,
  addPortfolioToLibrary,
  addTransactionToPortfolio,
  deletePortfolioFromLibrary,
} from "../..//domain/portfolio/portfolio";
import {
  CashTransaction,
  Order,
  Portfolio,
  PortfolioLibrary,
} from "../..//domain/types";

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

export function useAddCashTransactionToPortfolio(portfolio: string) {
  const addTransaction: (
    library: PortfolioLibrary,
    transaction: CashTransaction
  ) => PortfolioLibrary = (lib, transaction) => {
    if (!lib[portfolio]) {
      console.error(
        "portfolio with name",
        portfolio,
        "unexpectedly not found in library:",
        JSON.stringify(lib, null, 4)
      );
      return lib;
    }
    const newPortfolio = addTransactionToPortfolio(lib[portfolio], transaction);
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(addTransaction);
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

type PortfolioUpdate = Portfolio | Order | CashTransaction;

type PortfolioUpdater<T extends PortfolioUpdate> = (
  lib: PortfolioLibrary,
  update: T
) => PortfolioLibrary;

import { useMutation, useQuery, useQueryClient } from "react-query";
import { DividendPayout } from "../../../../domain/dividendPayouts/dividend.entities";
import { Order } from "../../../../domain/order/order.entities";
import { getActivitiesForPortfolio } from "../../../../domain/portfolio/portfolio.derivers";
import {
  Portfolio,
  PortfolioLibrary,
} from "../../../../domain/portfolio/portfolio.entities";
import {
  addDividendPayoutToPortfolio,
  addOrderToPortfolio,
  addPortfolioToLibrary,
  deleteDividendPayoutFromPortfolio,
  deleteOrderFromPortfolio,
  deletePortfolioFromLibrary,
} from "../../../../domain/portfolio/portfolio.operations";

export function useGetPortfolioActivity(portfolio: string) {
  return useQuery("portfolios", fetchPortfolios, {
    select: (lib) => {
      return getActivitiesForPortfolio(lib[portfolio]);
    },
  });
}

export function useGetPortfolio(name: string) {
  return useQuery("portfolios", fetchPortfolios, {
    select: (lib) => lib[name],
  });
}

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
      onSuccess: (_, update) => {
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
    const newPortfolio = addOrderToPortfolio(lib[portfolio], order);
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(addOrder);
}

export function useDeleteOrderFromPortfolio(portfolio: string) {
  const deleteOrder: (
    library: PortfolioLibrary,
    order: Order
  ) => PortfolioLibrary = (lib, order) => {
    const newPortfolio = deleteOrderFromPortfolio(lib[portfolio], order);
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(deleteOrder);
}

export function useDeleteDividendPayoutFromPortfolio(portfolio: string) {
  const deleteOrder: (
    library: PortfolioLibrary,
    payout: DividendPayout
  ) => PortfolioLibrary = (lib, payout) => {
    const newPortfolio = deleteDividendPayoutFromPortfolio(
      lib[portfolio],
      payout
    );
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(deleteOrder);
}

export function useAddDividendPayoutToPortfolio(portfolio: string) {
  const addDividendPayout: (
    library: PortfolioLibrary,
    payout: DividendPayout
  ) => PortfolioLibrary = (lib, payout) => {
    const newPortfolio = addDividendPayoutToPortfolio(lib[portfolio], payout);
    return addPortfolioToLibrary(lib, newPortfolio);
  };
  return useUpdatePortfolios(addDividendPayout);
}

const fetchPortfolios = async (): Promise<Record<string, Portfolio>> => {
  const response = await fetch("/api/portfolios/get-portfolios/");
  return response.json();
};

const savePortfoliosOnServer = async (portfolioLib: PortfolioLibrary) => {
  return fetch("/api/portfolios/save-portfolios", {
    method: "PUT",
    body: JSON.stringify(portfolioLib),
    headers: { "Content-Type": "application/json" },
  });
};

type PortfolioUpdate = Portfolio | Order | DividendPayout | string;

type PortfolioUpdater<T extends PortfolioUpdate> = (
  lib: PortfolioLibrary,
  update: T
) => PortfolioLibrary;

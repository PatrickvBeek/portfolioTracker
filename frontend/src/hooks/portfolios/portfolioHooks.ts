import { useMutation, useQuery, useQueryClient } from "react-query";
import { DividendPayout } from "../../../../domain/src/dividendPayouts/dividend.entities";
import { Order } from "../../../../domain/src/order/order.entities";
import { getActivitiesForPortfolio } from "../../../../domain/src/portfolio/portfolio.derivers";
import {
  Portfolio,
  PortfolioLibrary,
} from "../../../../domain/src/portfolio/portfolio.entities";
import {
  addDividendPayoutToPortfolio,
  addOrderToPortfolio,
  addPortfolioToLibrary,
  deleteDividendPayoutFromPortfolio,
  deleteOrderFromPortfolio,
  deletePortfolioFromLibrary,
} from "../../../../domain/src/portfolio/portfolio.operations";

export function useGetPortfolios() {
  return useQuery("portfolios", fetchPortfolios);
}

export function useSetPortfolios() {
  const client = useQueryClient();
  return useMutation(savePortfoliosOnServer, {
    onSuccess: () => {
      client.invalidateQueries("portfolios");
    },
  });
}

export function usePortfolioQuery<T>(
  portfolioName: string,
  selector: (p: Portfolio) => T,
  enabled?: boolean
) {
  return useQuery("portfolios", fetchPortfolios, {
    select: (lib) => {
      const portfolio = lib[portfolioName];
      return portfolio && selector(portfolio);
    },
    enabled,
  });
}

export function useGetPortfolioActivity(portfolioName: string) {
  return useQuery("portfolios", fetchPortfolios, {
    select: (lib) => {
      const portfolio = lib[portfolioName];
      return portfolio ? getActivitiesForPortfolio(portfolio) : [];
    },
  });
}

export function useGetPortfolio(name: string) {
  return useQuery("portfolios", fetchPortfolios, {
    select: (lib) => lib[name],
  });
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
  const response = await fetch("/api/portfolios");
  return response.json();
};

const savePortfoliosOnServer = async (portfolioLib: PortfolioLibrary) => {
  return fetch("/api/portfolios", {
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

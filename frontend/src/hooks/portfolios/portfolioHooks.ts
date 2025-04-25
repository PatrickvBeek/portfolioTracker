import { DividendPayout } from "pt-domain/src/dividendPayouts/dividend.entities";
import { Order } from "pt-domain/src/order/order.entities";
import { getActivitiesForPortfolio } from "pt-domain/src/portfolio/portfolio.derivers";
import {
  Portfolio,
  PortfolioLibrary,
} from "pt-domain/src/portfolio/portfolio.entities";
import {
  addDividendPayoutToPortfolio,
  addOrderToPortfolio,
  addPortfolioToLibrary,
  deleteDividendPayoutFromPortfolio,
  deleteOrderFromPortfolio,
  deletePortfolioFromLibrary,
} from "pt-domain/src/portfolio/portfolio.operations";
import { useContext } from "react";
import { UserDataContext } from "../../userDataContext";

export const usePortfolioSelector = <T>(
  portfolioName: string,
  selector: (p: Portfolio) => T
): T | undefined => {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio && selector(portfolio);
};

export function useGetPortfolios() {
  const { portfolios } = useContext(UserDataContext);
  return portfolios;
}

export function useSetPortfolios() {
  const { setPortfolios } = useContext(UserDataContext);
  return (portfolios: PortfolioLibrary) => {
    setPortfolios(portfolios);
    localStorage.setItem("portfolios", JSON.stringify(portfolios));
  };
}

export function useGetPortfolio(name: string): Portfolio {
  const portfolios = useGetPortfolios();
  return (
    portfolios[name] ?? {
      name: "",
      orders: {},
      dividendPayouts: {},
    }
  );
}

export function useGetPortfolioActivity(portfolioName: string) {
  const portfolio = useGetPortfolio(portfolioName);
  return portfolio ? getActivitiesForPortfolio(portfolio) : [];
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
  const { setPortfolios, portfolios } = useContext(UserDataContext);

  return (update: T) => {
    const newLib = updater(portfolios, update);
    setPortfolios(newLib);
    localStorage.setItem("portfolios", JSON.stringify(newLib));
  };
}

export function useAddOrderToPortfolio(portfolio: string) {
  return useUpdatePortfolios<Order>((lib, order) => {
    const newPortfolio = addOrderToPortfolio(lib[portfolio], order);
    return addPortfolioToLibrary(lib, newPortfolio);
  });
}

export function useDeleteOrderFromPortfolio(portfolio: string) {
  return useUpdatePortfolios<Order>((lib, order) => {
    const newPortfolio = deleteOrderFromPortfolio(lib[portfolio], order);
    return addPortfolioToLibrary(lib, newPortfolio);
  });
}

export function useDeleteDividendPayoutFromPortfolio(portfolio: string) {
  return useUpdatePortfolios<DividendPayout>((lib, payout) => {
    const newPortfolio = deleteDividendPayoutFromPortfolio(
      lib[portfolio],
      payout
    );
    return addPortfolioToLibrary(lib, newPortfolio);
  });
}

export function useAddDividendPayoutToPortfolio(portfolio: string) {
  return useUpdatePortfolios<DividendPayout>((lib, payout) => {
    const newPortfolio = addDividendPayoutToPortfolio(lib[portfolio], payout);
    return addPortfolioToLibrary(lib, newPortfolio);
  });
}

type PortfolioUpdate = Portfolio | Order | DividendPayout | string;

type PortfolioUpdater<T extends PortfolioUpdate> = (
  lib: PortfolioLibrary,
  update: T
) => PortfolioLibrary;

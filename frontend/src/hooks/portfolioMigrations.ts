import { Order } from "../../../domain/src/order/order.entities";
import {
  Portfolio,
  PortfolioLibrary,
} from "../../../domain/src/portfolio/portfolio.entities";

function mapOrder(order: Omit<Order, "taxes">): Order {
  return { ...order, taxes: 0 };
}

function mapPortfolio(portfolio: Portfolio) {
  const mappedOrders = Object.fromEntries(
    Object.entries(portfolio.orders).map(([isin, orders]) => [
      isin,
      orders.map(mapOrder),
    ]),
  );

  return {
    ...portfolio,
    orders: mappedOrders,
  };
}

function mapLib(library: PortfolioLibrary) {
  const mappedLib = Object.fromEntries(
    Object.entries(library).map(([name, portfolio]) => [
      name,
      mapPortfolio(portfolio),
    ]),
  );

  console.log(JSON.stringify(mappedLib, null, 4));
}

fetch("http://localhost:3000/portfolios/get-portfolios/").then((lib) => {
  lib.json().then((lib) => {
    const mappedLib = mapLib(lib);
    console.log(JSON.stringify(mappedLib, null, 4));
  });
});

import { Order } from "../order/order.entities";

export interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
}

export interface PortfolioLibrary {
  [identifier: string]: Portfolio;
}

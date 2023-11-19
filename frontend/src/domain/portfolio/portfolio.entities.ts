import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";

export interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
  dividendPayouts: Record<string, DividendPayout[]>;
}

export interface PortfolioLibrary {
  [identifier: string]: Portfolio;
}

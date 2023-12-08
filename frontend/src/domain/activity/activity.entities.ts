import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";

export type PortfolioActivity = Order | DividendPayout;

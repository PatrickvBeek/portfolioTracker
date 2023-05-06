import { Order } from "../../dataClasses/general";
import {
  addOrderToPortfolio,
  deleteOrderFromPortfolio,
  Portfolio,
} from "../../dataClasses/portfolio/portfolio";
import { JsonWriter } from "../jsonWriter/jsonWriter";

export class PortfolioLibrary {
  path: string;
  fileName: string;
  portfolios: Record<string, Portfolio> = {};
  writer: JsonWriter;
  constructor(path: string, file: string) {
    this.fileName = file;
    this.path = path;
    this.writer = new JsonWriter(this.path);
  }

  createPortfolio(portfolioName: string) {
    this.portfolios = {
      ...this.portfolios,
      [portfolioName]: { name: portfolioName, orders: {} },
    };
  }

  deletePortfolio(portfolioName: string) {
    this.portfolios = Object.keys(this.portfolios).reduce(
      (portfolios, currentName) => {
        if (currentName != portfolioName) {
          portfolios[currentName] = this.portfolios[currentName];
        }
        return portfolios;
      },
      {} as Record<string, Portfolio>
    );
  }

  addOrder(body: { portfolio: string; order: Order }) {
    this.portfolios = {
      ...this.portfolios,
      [body.portfolio]: addOrderToPortfolio(
        this.portfolios[body.portfolio],
        body.order
      ),
    };
  }

  deleteOrder(body: { portfolio: string; order: Order }) {
    this.portfolios = {
      ...this.portfolios,
      [body.portfolio]: deleteOrderFromPortfolio(
        this.portfolios[body.portfolio],
        body.order
      ),
    };
  }

  clear() {
    this.portfolios = {};
    this.write();
  }

  async write() {
    await this.writer.write(this.portfolios, this.fileName);
  }

  async read() {
    this.portfolios = await this.writer.read(this.fileName);
  }
}

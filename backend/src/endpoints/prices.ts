import AlphaVantage from "alphavantage-wrapper-ts";
import { Express, Request, Response } from "express";

export const handlePrices = (app: Express): void => {
  app.get("/api/prices", async (req: Request, res: Response) => {
    const symbol = req.query.symbol?.toString();
    if (!symbol) {
      console.log("no symbol given");
      res.status(400).send();
      return;
    }

    const av = new AlphaVantage({
      apikey: (1000 * Math.random()).toString(36),
    });
    try {
      const prices = await av.stockTimeSeries.weeklyAdjusted({ symbol });
      const series = Object.entries(prices.timeSeries).map(
        ([dateString, price]) => ({
          timestamp: new Date(dateString).getTime(),
          value: price.adjustedClose,
        })
      );
      console.log(`sending for symbol: ${req.query.symbol}`);
      res.status(200).send(series);
    } catch (error) {
      console.log("cannot fetch prices for symbol: ", symbol);
      res.status(404).send();
    }
  });
};

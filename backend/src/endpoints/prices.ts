import AlphaVantage from "alphavantage-wrapper-ts";
import {
  DailyAdjustedResponse,
  MonthlyAdjustedResponse,
  WeeklyAdjustedResponse,
} from "alphavantage-wrapper-ts/dist/stock-time-series";
import { Express, Request, Response } from "express";
import { PRICE_FREQUENCY, PriceQueryParams, PriceResponse } from "../../../api";
import { Series } from "../../../domain/src/series/series.entities";

export const handlePrices = (app: Express): void => {
  app.get(
    "/api/prices",
    async (
      req: Request<{}, {}, {}, PriceQueryParams>,
      res: Response<PriceResponse>,
    ) => {
      try {
        const series = await getSeriesWithAv(req.query);
        res.status(200).send(series);
      } catch (error) {
        res.status(404).send();
      }
    },
  );
};

async function getSeriesWithAv(
  query: PriceQueryParams,
): Promise<Series<number>> {
  return mapAvPricesToSeries(await getAvPrices(query));
}

function getAvPrices({ frequency, symbol }: PriceQueryParams) {
  const av = new AlphaVantage({ apikey: (1000 * Math.random()).toString(36) });

  switch (frequency) {
    case PRICE_FREQUENCY.DAILY:
      return av.stockTimeSeries.dailyAdjusted({ symbol });
    case PRICE_FREQUENCY.WEEKLY:
      return av.stockTimeSeries.weeklyAdjusted({ symbol });
    case PRICE_FREQUENCY.MONTHLY:
      return av.stockTimeSeries.monthlyAdjusted({ symbol });
  }
  assertUnreachable(frequency);
}

function mapAvPricesToSeries(
  prices:
    | WeeklyAdjustedResponse
    | MonthlyAdjustedResponse
    | DailyAdjustedResponse,
): Series<number> {
  return Object.entries(prices.timeSeries).map(([dateString, price]) => ({
    timestamp: new Date(dateString).getTime(),
    value: parseFloat(price.adjustedClose),
  }));
}

function assertUnreachable(x: never): never {
  throw Error(`${x} should never happen`);
}

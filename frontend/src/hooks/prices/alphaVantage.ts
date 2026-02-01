import { History } from "pt-domain";
import { throttle } from "../../utility/throttle";

const fetchPricesFromAlphaVantage = async (
  symbol: string
): Promise<History<number>> => {
  if (!symbol) {
    return Promise.resolve([]);
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=free_tier`
  );
  const prices = (await response.json()) as AlphaVantageDailyResult;

  return Object.entries(prices["Weekly Time Series"]).map(
    ([dateString, price]) => ({
      timestamp: new Date(dateString).getTime(),
      value: parseFloat((price as any)["4. close"]),
    })
  );
};

const isTest = import.meta.env.MODE === "test";

export const getPricesFromAlphaVantage = isTest
  ? fetchPricesFromAlphaVantage
  : throttle(fetchPricesFromAlphaVantage, 1000);

export type AlphaVantageDailyResult = {
  "Weekly Time Series": Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  >;
};

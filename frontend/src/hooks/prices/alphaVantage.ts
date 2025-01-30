import { History } from "pt-domain/src/portfolioHistory/history.entities";

export const getPricesFromAlphaVantage = async (
  symbol: string
): Promise<History<number>> => {
  if (!symbol) {
    return Promise.resolve([]);
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=free_tier`
  );
  const prices = (await response.json()) as AlphaVantageDailyResult;

  return Object.entries(prices["Time Series (Daily)"]).map(
    ([dateString, price]) => ({
      timestamp: new Date(dateString).getTime(),
      value: parseFloat((price as any)["4. close"]),
    })
  );
};

export type AlphaVantageDailyResult = {
  "Time Series (Daily)": Record<
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

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
  const prices = await response.json();

  return Object.entries(prices["Time Series (Daily)"]).map(
    ([dateString, price]) => ({
      timestamp: new Date(dateString).getTime(),
      value: parseFloat((price as any)["4. close"]),
    })
  );
};

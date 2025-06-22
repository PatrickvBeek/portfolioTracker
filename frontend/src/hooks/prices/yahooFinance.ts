import { History } from "pt-domain";
import { zip } from "radash";

const BASE_URL = "https://yfapi.net";

export const getPricesFromYahooFinance =
  (apiKey: string) =>
  async (symbol: string): Promise<History<number>> => {
    if (!symbol) {
      return Promise.resolve([]);
    }
    const response = await fetch(
      `${BASE_URL}/v8/finance/chart/${symbol}?range=10y&interval=1d&includePrePost=true&events=div%7Csplit`,
      {
        headers: {
          accept: "application/json",
          "X-API-KEY": apiKey,
        },
      }
    );
    const parsed = (await response.json()) as YahooChartResponse;

    return (
      zip(
        parsed.chart.result[0]?.timestamp,
        parsed.chart.result[0]?.indicators.adjclose[0]?.adjclose
      )
        .map(([t_in_s, price]) => ({ timestamp: t_in_s * 1000, value: price }))
        .toReversed()
        // Unfortunately,there can be 'null' values...
        .filter((point) => typeof point.value === "number")
    );
  };

type YahooChartResponse = {
  chart: {
    result: YahooChartResult[];
  };
};

type YahooChartResult = {
  indicators: { adjclose: Array<{ adjclose: number[] }> };
  timestamp: number[];
};

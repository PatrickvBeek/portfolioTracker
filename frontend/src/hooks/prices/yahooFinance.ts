import { History } from "pt-domain/src/portfolioHistory/history.entities";
import { zip } from "radash";

const BASE_URL = "https://query2.finance.yahoo.com";

export const getPricesFromYahooFinance = async (
  symbol: string
): Promise<History<number>> => {
  const response = await fetch(
    `${BASE_URL}/v8/finance/chart/${symbol}?period1=0&period2=9999999999&interval=1d&includePrePost=true&events=div%7Csplit`
  );
  const parsed = (await response.json()) as YahooChartResponse;

  return zip(
    parsed.chart.result[0]?.timestamp,
    parsed.chart.result[0]?.indicators.adjclose[0]?.adjclose
  ).map(([timestamp, value]) => ({ timestamp, value }));
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

import { sum } from "radash";
import { DividendPayout } from "./dividend.entities";

export const sumDividends = (dividends: DividendPayout[]): number =>
  sum(dividends.map(getDividendVolume));

export const sumDividendTaxes = (dividends: DividendPayout[]): number =>
  sum(dividends.map((d) => d.taxes));

export const getDividendVolume = ({
  dividendPerShare,
  pieces,
}: DividendPayout): number => dividendPerShare * pieces;

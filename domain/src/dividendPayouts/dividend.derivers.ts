import { sum } from "radash";
import { DividendPayout } from "./dividend.entities";

export const sumDividendTaxes = (dividends: DividendPayout[]): number =>
  sum(dividends.map((d) => d.taxes));

export const getDividendVolume = ({
  dividendPerShare,
  pieces,
}: DividendPayout): number => dividendPerShare * pieces;

export const getDividendNetVolume = ({
  dividendPerShare,
  pieces,
  taxes,
}: DividendPayout): number => dividendPerShare * pieces - taxes;

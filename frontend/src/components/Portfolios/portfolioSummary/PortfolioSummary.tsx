import { FC, ReactNode } from "react";
import { cn } from "../../../utility/cn";
import Balance from "../../general/Balance/Balance";
import { Heading } from "../../ui/Heading";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import Tile from "../../general/Tile";
import {
  useCashFlow,
  useMarketValue,
  useNonRealizedGains,
  usePortfolioAge,
  useRealizedGains,
  useTimeWeightedReturn,
} from "./PortfolioSummary.logic";
import { styles } from "./PortfolioSummary.styles";

export const PortfolioSummary: FC<{ portfolioNames: string[] }> = ({
  portfolioNames,
}) => {
  const cashFlow = useCashFlow(portfolioNames);
  const realizedGains = useRealizedGains(portfolioNames);
  const nonRealizedGainsQuery = useNonRealizedGains(portfolioNames);
  const marketValue = useMarketValue(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);
  const twr = useTimeWeightedReturn(portfolioNames);
  const twrA = twr?.data && Math.pow(twr.data, 1 / portfolioAge);

  return (
    <div>
      <Heading level="h1" className={styles.headline}>
        Summary
      </Heading>
      <div className={styles.tiles}>
        <SummaryTile
          title={"Balances"}
          entries={[
            { label: "Cash Flow", value: <Balance value={cashFlow ?? NaN} /> },
            {
              label: "Realized Gains",
              value: <Balance value={realizedGains ?? NaN} />,
            },
            {
              label: "Non-Realized Gains",
              value: nonRealizedGainsQuery?.isLoading ? (
                <LoadingIndicator />
              ) : (
                <Balance value={nonRealizedGainsQuery?.data ?? NaN} />
              ),
            },
            {
              label: "Total Value",
              value: marketValue?.isLoading ? (
                <LoadingIndicator />
              ) : (
                <Balance value={marketValue?.data ?? NaN} />
              ),
              sumRow: true,
            },
          ]}
        />
        <SummaryTile
          title={"Metrics"}
          entries={[
            {
              label: "Portfolio Age",
              value: `${portfolioAge.toFixed(1)} years`,
            },
            {
              label: "Average Annual Cash Flow",
              value: (
                <Balance value={cashFlow ? cashFlow / portfolioAge : NaN} />
              ),
            },
            {
              label: "Time Weighted Return",
              value: twr?.isLoading ? (
                <LoadingIndicator />
              ) : (
                `${twr?.data ? ((twr.data - 1) * 100).toFixed(1) : NaN} %`
              ),
            },
            {
              label: "\u2B91 Annualized",
              value: twr?.isLoading ? (
                <LoadingIndicator />
              ) : (
                `${twrA ? ((twrA - 1) * 100).toFixed(1) : NaN} %`
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

const SummaryTile: FC<{
  entries: { label: string; value: ReactNode; sumRow?: boolean }[];
  title: string;
}> = ({ entries, title }) => (
  <Tile header={title}>
    <div className={styles.rows}>
      {entries.map(({ label, value, sumRow }) => (
        <SummaryTileRow
          key={label}
          label={label}
          value={value}
          sumRow={sumRow}
        />
      ))}
    </div>
  </Tile>
);

const SummaryTileRow: FC<{
  label: string;
  value: ReactNode;
  sumRow?: boolean;
}> = ({ label, value, sumRow }) => (
  <div className={cn(styles.row, sumRow && styles.sumRow)}>
    <span>{label}</span>
    <span className={styles.rowValue}>{value}</span>
  </div>
);

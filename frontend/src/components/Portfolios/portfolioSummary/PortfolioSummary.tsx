import classNames from "classnames";
import { FC, ReactNode } from "react";
import Balance from "../../general/Balance/Balance";
import { Headline } from "../../general/headline/Headline";
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
import styles from "./PortfolioSummary.module.less";

export const PortfolioSummary: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const cashFlow = useCashFlow(portfolioName);
  const realizedGains = useRealizedGains(portfolioName);
  const nonRealizedGainsQuery = useNonRealizedGains(portfolioName);
  const marketValue = useMarketValue(portfolioName);
  const portfolioAge = usePortfolioAge(portfolioName);
  const twr = useTimeWeightedReturn(portfolioName);
  const twrA = twr?.data && Math.pow(twr.data, 1 / portfolioAge);

  return (
    <div>
      <Headline text={"Summary"} />
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
    <div className={classNames(styles.rows)}>
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
  <div className={classNames(styles.row, { [styles.sum_row]: sumRow })}>
    <span>{label}</span>
    <span className={styles.row_value}>{value}</span>
  </div>
);

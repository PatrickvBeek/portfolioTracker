import { Info } from "lucide-react";
import { FC, ReactNode } from "react";
import { rel2percentage } from "pt-domain";
import { cn } from "../../../utility/cn";
import Balance from "../../general/Balance/Balance";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import { Heading } from "../../ui/Heading";
import { Tooltip } from "../../ui/Tooltip";
import { pageLayout } from "../../ui/page-layout.styles";
import {
  useAnnualizedReturn,
  useCashFlow,
  useMarketValue,
  useNonRealizedGains,
  usePortfolioAge,
  useRealAnnualizedReturn,
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
  const annualizedReturn = useAnnualizedReturn(portfolioNames);
  const realReturn = useRealAnnualizedReturn(portfolioNames);

  return (
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
            label: "Total Gains",
            value: nonRealizedGainsQuery?.isLoading ? (
              <LoadingIndicator />
            ) : (
              <Balance
                value={realizedGains + (nonRealizedGainsQuery?.data ?? 0)}
              />
            ),
            sumRow: true,
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
            value: <Balance value={cashFlow ? cashFlow / portfolioAge : NaN} />,
          },
          {
            label: "Time Weighted Return",
            value: twr?.isLoading ? (
              <LoadingIndicator />
            ) : (
              `${twr?.data ? rel2percentage(twr.data).toFixed(1) : NaN} %`
            ),
          },
          {
            label: "\u2B91 Annualized",
            value: annualizedReturn?.isLoading ? (
              <LoadingIndicator />
            ) : (
              `${annualizedReturn?.data !== undefined ? rel2percentage(annualizedReturn.data).toFixed(1) : NaN} %`
            ),
          },
          {
            label: "Annualized Real Return",
            value: realReturn?.isLoading ? (
              <LoadingIndicator />
            ) : (
              `${realReturn?.data !== undefined ? rel2percentage(realReturn.data).toFixed(1) : NaN} %`
            ),
            info: "The annualized return adjusted for inflation, showing the real purchasing power gained or lost over time. Inflation is assumed to be 2% p.a., as this is the EZB's target rate.",
          },
        ]}
      />
    </div>
  );
};

const SummaryTile: FC<{
  entries: {
    label: string;
    value: ReactNode;
    sumRow?: boolean;
    info?: string;
  }[];
  title: string;
}> = ({ entries, title }) => (
  <div className={cn(pageLayout.sectionCard, styles.tile)}>
    <div className={pageLayout.sectionBody}>
      <Heading level="section">{title}</Heading>
      <div className={styles.rows}>
        {entries.map(({ label, value, sumRow, info }) => (
          <SummaryTileRow
            key={label}
            label={label}
            value={value}
            sumRow={sumRow}
            info={info}
          />
        ))}
      </div>
    </div>
  </div>
);

const SummaryTileRow: FC<{
  label: string;
  value: ReactNode;
  sumRow?: boolean;
  info?: string;
}> = ({ label, value, sumRow, info }) => (
  <div className={cn(styles.row, sumRow && styles.sumRow)}>
    <span className={styles.labelWithInfo}>
      {label}
      {info && (
        <Tooltip content={info} side="top" className="max-w-64">
          <Info className={styles.infoIcon} />
        </Tooltip>
      )}
    </span>
    <span className={styles.rowValue}>{value}</span>
  </div>
);

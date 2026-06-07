import { AssetReturnAndVolatility } from "pt-domain";
import moment from "moment";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "../../charts/ChartContainer";
import { getSplitColorGradientDef } from "../../charts/chartElements";
import { CHART_RANGES, ChartRange } from "../../charts/chartRange.types";
import { ChartRangeSelector } from "../../charts/ChartRangeSelector";
import {
  CHART_GRID_STROKE,
  DEFAULT_LINE_PROPS,
  TOOLTIP_STYLE,
  getAxisProps,
  getTimeAxisProps,
} from "../../charts/chartUtils";
import { Select } from "../../ui/Select";
import { useAssetPriceChartData } from "./AssetPriceHistory.logic";
import { styles } from "./AssetPriceHistory.styles";

const chartRangeValues = Object.values(CHART_RANGES) as string[];

function isChartRange(value: string): value is ChartRange {
  return chartRangeValues.includes(value);
}

function AssetStatBar({ stats }: { stats: AssetReturnAndVolatility }) {
  return (
    <div
      className={styles.statBar}
      role="region"
      aria-label="Return / Volatility stats"
    >
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Return</span>
        <span className={styles.statValue}>
          {stats.annualizedReturn.toFixed(2)}%
        </span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Volatility</span>
        <span className={styles.statValue}>
          {stats.annualizedVolatility.toFixed(2)}%
        </span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>R/V</span>
        <span className={styles.statValue}>{stats.ratio.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function AssetPriceHistory({ symbol }: { symbol?: string }) {
  const [range, setRange] = useState<ChartRange>(CHART_RANGES.Max);
  const { isLoading, isError, data, baseline, stats } = useAssetPriceChartData(
    symbol,
    range
  );

  if (!symbol) {
    return (
      <div
        className={styles.container}
        role="region"
        aria-label="Price history"
      >
        <p className={styles.hint}>
          No symbol connected — price history unavailable.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={styles.container}
        role="region"
        aria-label="Price history"
      >
        <p className={styles.hint}>Failed to load price history.</p>
      </div>
    );
  }

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    data,
    "value",
    { baseline }
  );

  const handleMobileRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isChartRange(value)) {
      setRange(value);
    }
  };

  return (
    <div className={styles.container} role="region" aria-label="Price history">
      <div className={styles.controls}>
        <div className="hidden md:inline-flex">
          <ChartRangeSelector value={range} onChange={setRange} />
        </div>
        <div className="md:hidden">
          <Select
            name="price-history-range"
            value={range}
            onChange={handleMobileRangeChange}
          >
            {Object.values(CHART_RANGES).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <ChartContainer isLoading={isLoading}>
        <AreaChart data={data} margin={{ bottom: 30 }}>
          <XAxis {...getTimeAxisProps(data)} />
          <YAxis
            {...getAxisProps(data)}
            tickFormatter={(value) =>
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })
            }
          />
          <CartesianGrid stroke={CHART_GRID_STROKE} />
          {gradientDefinition}
          <Area
            {...DEFAULT_LINE_PROPS}
            strokeWidth={2}
            type="linear"
            dataKey="value"
            name="Price"
            stroke={strokeUrl}
            fill={fillUrl}
            fillOpacity={1}
            baseValue={baseline}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }),
              "Price",
            ]}
            labelFormatter={(value) =>
              moment(new Date(Number(value))).format("ddd DD.MM.YYYY")
            }
          />
        </AreaChart>
      </ChartContainer>
      {stats && <AssetStatBar stats={stats} />}
    </div>
  );
}

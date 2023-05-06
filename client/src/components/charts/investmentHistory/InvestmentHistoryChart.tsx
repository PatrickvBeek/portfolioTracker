import { ReactElement } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getInitialValueSeriesForPortfolio } from "../../../domain/series/series.derivers";
import { useGetPortfolios } from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { getAxisProps, getTimeAxisProps } from "../axisUtils";
import "./InvestmentHistoryChart.css";

const { bemElement, bemBlock } = bemHelper("investment-history-chart");

export type InvestmentHistoryChartProps = Props<{
  portfolioName: string;
}>;

export function InvestmentHistoryChart({
  portfolioName,
  className,
}: InvestmentHistoryChartProps): ReactElement | null {
  const portfolioQuery = useGetPortfolios();

  if (!portfolioQuery.isSuccess) {
    return <div>no data</div>;
  }

  const portfolio = portfolioQuery.data[portfolioName];

  if (!portfolio) {
    return null;
  }

  const data = getInitialValueSeriesForPortfolio(portfolio);

  if (!data) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Initial Value History</div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradient" x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
              <stop
                offset={"5%"}
                stopColor="var(--theme-highlight)"
                stopOpacity={0.9}
              />
              <stop
                offset={"95%"}
                stopColor="var(--theme-highlight)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            type={"stepAfter"}
            stroke="var(--theme-highlight)"
            strokeWidth={3}
            dataKey={"value"}
            fill="url(#gradient)"
          />
          <Tooltip />
          <XAxis
            dataKey={"timestamp"}
            {...getTimeAxisProps(data.map((p) => p.timestamp))}
          />
          <YAxis {...getAxisProps(data.map((d) => d.value))} />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

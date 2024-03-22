import moment from "moment";
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
import { getInitialValueSeriesForPortfolio } from "../../../../../domain/series/series.derivers";
import { useGetPortfolio } from "../../../hooks/portfolios/portfolioHooks";
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
  const portfolioQuery = useGetPortfolio(portfolioName);

  if (portfolioQuery.isLoading || portfolioQuery.isFetching) {
    return <div>data is loading...</div>;
  }

  if (portfolioQuery.isError) {
    return <div>an error occurred loading the portfolio data</div>;
  }

  if (!portfolioQuery.isSuccess) {
    return null;
  }

  const portfolio = portfolioQuery.data;

  if (!portfolio) {
    return null;
  }

  const data = getInitialValueSeriesForPortfolio(portfolio);

  if (!data.length) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Initial Value History</div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <AreaChart data={data}>
          <Area
            type={"stepAfter"}
            stroke="var(--theme-highlight)"
            strokeWidth={3}
            dataKey={"value"}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2) + " €"]}
            labelFormatter={(value: number) =>
              moment(new Date(value)).format("ddd DD.MM.YYYY")
            }
          />
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

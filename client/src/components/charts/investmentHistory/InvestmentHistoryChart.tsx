import { sum } from "radash";
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
import { getPositionHistory } from "../../../domain/position/position.derivers";
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

  const data = getPositionHistory(Object.values(portfolio.orders).flat())?.map(
    (dataPoint) => ({
      date: dataPoint.date.getTime(),
      amount: sum(
        dataPoint.positions.open,
        (position) => position.buyPrice * position.pieces
      ),
    })
  );
  if (!data) {
    return null;
  }

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("heading")}>Investment History</div>
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
            dataKey={"amount"}
            fill="url(#gradient)"
          />
          <Tooltip />
          <XAxis
            dataKey={"date"}
            {...getTimeAxisProps(data.map((p) => p.date))}
          />
          <YAxis
            // domain={[0, (dataMax: number) => (1.15 * dataMax).toFixed(0)]}
            // tickCount={10}
            // interval={"preserveStart"}
            dataKey={"amount"}
            {...getAxisProps(data.map((d) => d.amount))}
          />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

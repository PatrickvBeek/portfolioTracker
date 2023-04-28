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

  let data = getPositionHistory(Object.values(portfolio.orders).flat())?.map(
    (dataPoint) => ({
      date: dataPoint.date.toISOString().slice(0, 10),
      amount: sum(
        dataPoint.positions.open,
        (position) => position.buyPrice * position.pieces
      ),
    })
  );

  console.table(data);

  // data = [
  //   { date: "1", amount: 1 },
  //   { date: "2", amount: 3 },
  //   { date: "3", amount: 10 },
  //   { date: "4", amount: 30 },
  //   { date: "5", amount: 100 },
  // ];

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
            type={"linear"}
            stroke="var(--theme-highlight)"
            strokeWidth={2}
            dataKey={"amount"}
            fill="url(#gradient)"
            dot={true}
          />
          <Tooltip />
          <XAxis dataKey={"date"} />
          <YAxis
            domain={[0, (dataMax: number) => (1.1 * dataMax).toFixed(0)]}
            tickCount={10}
          />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

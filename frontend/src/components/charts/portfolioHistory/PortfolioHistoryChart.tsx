import moment from "moment";
import { FC } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAxisProps, getTimeAxisProps } from "../axisUtils";
import { useGetPortfolioHistoryChartData } from "./PortfolioHistoryChart.logic";
import styles from "./PortfolioHistoryChart.module.less";

export const PortfolioHistoryChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const chartData = useGetPortfolioHistoryChartData(portfolioName);

  if (!chartData.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Portfolio History</div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <AreaChart data={chartData}>
          <Legend />
          <Area
            type={"stepAfter"}
            stroke="var(--theme-highlight)"
            strokeWidth={3}
            dataKey={"cashFlow"}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Area
            type={"stepAfter"}
            stroke="var(--orange)"
            strokeWidth={3}
            dataKey={"buyValue"}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }) + " €",
            ]}
            labelFormatter={(value: number) =>
              moment(new Date(value)).format("ddd DD.MM.YYYY")
            }
          />
          <XAxis
            dataKey={"timestamp"}
            {...getTimeAxisProps(chartData.map((p) => p.timestamp))}
          />
          <YAxis {...getAxisProps(chartData.map((d) => d.buyValue))} />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

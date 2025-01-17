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
            dataKey={"cashFlow"}
            name={"Cash Flow"}
            type={"stepAfter"}
            connectNulls
            stroke="var(--theme-highlight)"
            strokeWidth={3}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Area
            dataKey={"buyValue"}
            name={"Buy Value"}
            type={"stepAfter"}
            connectNulls
            stroke="var(--orange)"
            strokeWidth={3}
            fill="url(#gradient)"
            animationDuration={300}
          />
          <Tooltip
            formatter={(value, name) => [
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }) + " €",
              name,
            ]}
            labelFormatter={(value: number) =>
              moment(new Date(value)).format("ddd DD.MM.YYYY")
            }
          />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis {...getAxisProps(chartData)} />
          <CartesianGrid stroke="#ccc" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

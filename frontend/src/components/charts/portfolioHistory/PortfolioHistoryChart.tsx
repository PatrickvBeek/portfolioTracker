import moment from "moment";
import { FC } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  PortfolioHistoryDataSets,
  useGetPortfolioHistoryChartData,
} from "./PortfolioHistoryChart.logic";
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
      <div className={styles.heading}>Balances</div>
      <ResponsiveContainer aspect={2.5} width={"100%"}>
        <LineChart data={chartData}>
          <Legend />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData)}
            tickFormatter={(value) => Number(value / 1000).toString()}
            unit={" k€"}
          />
          <CartesianGrid stroke="#ccc" />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"cashFlow" satisfies PortfolioHistoryDataSets}
            name={"Cash Flow"}
            stroke="var(--theme-highlight)"
          />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"buyValue" satisfies PortfolioHistoryDataSets}
            name={"Buy Value"}
            stroke="var(--orange)"
          />
          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"marketValue" satisfies PortfolioHistoryDataSets}
            name={"Market Value"}
            stroke="var(--green)"
            type={"linear"}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

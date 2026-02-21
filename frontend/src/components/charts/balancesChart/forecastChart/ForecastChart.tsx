import moment from "moment";
import { isArray } from "radash";
import { FC, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useCashFlow,
  usePortfolioAge,
} from "../../../Portfolios/portfolioSummary/PortfolioSummary.logic";
import { ChartContainer } from "../../ChartContainer";
import {
  asLocaleEuro,
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../../chartUtils";
import {
  ForecastChartDataSets,
  ForecastParameters,
  useForecastChartData,
} from "./ForecastChart.logic";
import { ForecastParametersPanel } from "./ForecastParametersPanel";

export const ForecastChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const cashFlow = useCashFlow(portfolioName);
  const portfolioAge = usePortfolioAge(portfolioName);
  const [params, setParams] = useState<ForecastParameters>({
    scenario: "portfolio",
    timeHorizon: "10Y",
    monthlyContribution:
      50 * Math.round((cashFlow ?? 0) / portfolioAge / 12 / 50),
    confidenceLevel: 68,
  });

  const { data, isLoading } = useForecastChartData(portfolioName, params);
  const chartData = data || [];

  return (
    <>
      <ForecastParametersPanel
        portfolioName={portfolioName}
        parameters={params}
        onParametersChange={setParams}
      />
      <ChartContainer isLoading={isLoading}>
        <ComposedChart data={chartData}>
          <Legend verticalAlign="bottom" />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData)}
            tickFormatter={(value) => Number(value / 1000).toString()}
            unit={" k€"}
          />
          <CartesianGrid stroke="#ccc" />

          <Area
            {...DEFAULT_LINE_PROPS}
            dataKey="uncertaintyBand"
            type="monotone"
            stroke="none"
            fill="rgba(0, 122, 48, 0.35)"
            connectNulls
            name={`Confidence Interval (${params.confidenceLevel}%)`}
          />

          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"cashFlow" satisfies ForecastChartDataSets}
            name={"Cash Flow"}
            stroke="var(--theme-highlight)"
            strokeDasharray="8 4"
            strokeWidth={2}
          />

          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"median" satisfies ForecastChartDataSets}
            name={"Market Value (Median)"}
            stroke="var(--green)"
            strokeDasharray="8 4"
            strokeWidth={2}
            type={"linear"}
          />

          <Line
            {...DEFAULT_LINE_PROPS}
            dataKey={"mean" satisfies ForecastChartDataSets}
            name={"Market Value (Mean)"}
            stroke="var(--dark-red)"
            strokeDasharray="8 4"
            strokeWidth={2}
            type={"linear"}
          />

          <Tooltip
            formatter={(value, name) =>
              isArray(value)
                ? [
                    `${asLocaleEuro(value[0], 0)} - ${asLocaleEuro(value[1], 0)}`,
                    name,
                  ]
                : [asLocaleEuro(value, 0), name]
            }
            labelFormatter={(value: number) =>
              moment(new Date(value)).format("ddd DD.MM.YYYY")
            }
          />
        </ComposedChart>
      </ChartContainer>
    </>
  );
};

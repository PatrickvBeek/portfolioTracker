import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import moment from "moment";
import { isArray } from "radash";
import { FC, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Headline } from "../../general/headline/Headline";
import {
  useCashFlow,
  usePortfolioAge,
} from "../../Portfolios/portfolioSummary/PortfolioSummary.logic";
import { ChartContainer } from "../ChartContainer";
import { getSplitColorGradientDef } from "../chartElements";
import {
  asLocaleEuro,
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
} from "../chartUtils";
import {
  BalancesChartDataSets,
  ForecastChartDataSets,
  ForecastParameters,
  useForecastChartData,
  useGetPortfolioHistoryChartData,
  useProfitHistory,
} from "./BalancesChart.logic";
import styles from "./BalancesChart.module.less";
import { ForecastParametersPanel } from "./ForecastParametersPanel";

type ViewMode = "total" | "profitLoss" | "forecast";

const TotalValueChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
  const { data, isLoading } = useGetPortfolioHistoryChartData(portfolioName);

  const chartData = data || [];

  return (
    <ChartContainer isLoading={isLoading}>
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
          dataKey={"cashFlow" satisfies BalancesChartDataSets}
          name={"Cash Flow"}
          stroke="var(--theme-highlight)"
          strokeOpacity={chartData.length ? 1 : 0.5}
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"buyValue" satisfies BalancesChartDataSets}
          name={"Buy Value"}
          stroke="var(--orange)"
          strokeOpacity={chartData.length ? 1 : 0.5}
        />
        <Line
          {...DEFAULT_LINE_PROPS}
          dataKey={"marketValue" satisfies BalancesChartDataSets}
          name={"Market Value"}
          stroke="var(--green)"
          type={"linear"}
          strokeOpacity={chartData.length ? 1 : 0.5}
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
    </ChartContainer>
  );
};

const ProfitChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
  const { isLoading, data } = useProfitHistory(portfolioName);

  const chartData = data ?? [];

  const { fillUrl, strokeUrl, gradientDefinition } = getSplitColorGradientDef(
    chartData,
    "value"
  );

  return (
    <ChartContainer isLoading={isLoading}>
      <AreaChart data={chartData}>
        <Legend />
        <XAxis {...getTimeAxisProps(chartData)} />
        <YAxis
          {...getAxisProps(chartData, 5, false)}
          tickFormatter={(value) => Number(value / 1000).toString()}
          unit={" k€"}
        />
        <CartesianGrid stroke="#ccc" />
        {gradientDefinition}
        <Area
          {...DEFAULT_LINE_PROPS}
          strokeWidth={2}
          type="linear"
          dataKey={"value"}
          name="Profit"
          stroke={strokeUrl}
          fill={fillUrl}
          fillOpacity={1}
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
      </AreaChart>
    </ChartContainer>
  );
};

const ForecastChart: FC<{ portfolioName: string }> = ({ portfolioName }) => {
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
          <Legend />
          <XAxis {...getTimeAxisProps(chartData)} />
          <YAxis
            {...getAxisProps(chartData, 5, false)}
            tickFormatter={(value) => Number(value / 1000).toString()}
            domain={[0, "dataMax"]}
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
            name={"Cash Flow (Forecast)"}
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

export const PortfolioBalancesChart: FC<{ portfolioName: string }> = ({
  portfolioName,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("total");

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headingContainer}>
        <Headline text={"Balances"} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="chart view mode"
          size="small"
          color="primary"
        >
          <ToggleButton value="total" aria-label="total value">
            Total Value
          </ToggleButton>
          <ToggleButton value="profitLoss" aria-label="profit/loss">
            Profit / Loss
          </ToggleButton>
          <ToggleButton value="forecast" aria-label="forecast">
            Forecast
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {viewMode === "total" && (
        <TotalValueChart portfolioName={portfolioName} />
      )}
      {viewMode === "profitLoss" && (
        <ProfitChart portfolioName={portfolioName} />
      )}
      {viewMode === "forecast" && (
        <ForecastChart portfolioName={portfolioName} />
      )}
    </div>
  );
};

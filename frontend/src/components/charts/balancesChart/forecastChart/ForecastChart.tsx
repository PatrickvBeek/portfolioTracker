import { FC, useState } from "react";
import {
  useCashFlow,
  usePortfolioAge,
} from "../../../Portfolios/portfolioSummary/PortfolioSummary.logic";
import { ChartContainer } from "../../ChartContainer";
import { ChartRange } from "../../chartRange.types";
import { ForecastChartBody } from "../../ForecastChartBody";
import { deriveMonthlyContribution } from "../../forecastChartUtils";
import {
  ForecastParameters,
  useForecastChartData,
} from "./ForecastChart.logic";
import { ForecastParametersPanel } from "./ForecastParametersPanel";

export const ForecastChart: FC<{
  portfolioNames: string[];
  range: ChartRange;
}> = ({ portfolioNames }) => {
  const cashFlow = useCashFlow(portfolioNames);
  const portfolioAge = usePortfolioAge(portfolioNames);
  const [params, setParams] = useState<ForecastParameters>({
    scenario: "portfolio",
    timeHorizon: "10Y",
    monthlyContribution: deriveMonthlyContribution(cashFlow, portfolioAge),
    confidenceLevel: 68,
    inflationRate: 0.02,
  });

  const { data, isLoading } = useForecastChartData(portfolioNames, params);
  const chartData = data || [];

  return (
    <>
      <ForecastParametersPanel
        portfolioNames={portfolioNames}
        parameters={params}
        onParametersChange={setParams}
      />
      <ChartContainer isLoading={isLoading}>
        <ForecastChartBody
          data={chartData}
          labels={{
            band: `Confidence Interval (${params.confidenceLevel}%)`,
            median: "Market Value (Median)",
            cashFlow: "Cash Flow",
          }}
        />
      </ChartContainer>
    </>
  );
};

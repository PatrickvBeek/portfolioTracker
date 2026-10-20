import { AlertTriangle } from "lucide-react";
import { useState } from "react";
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
import { isArray } from "radash";
import moment from "moment";
import { Heading } from "../ui/Heading";
import { Input } from "../ui/Input";
import { ToggleGroup, ToggleItem } from "../ui/ToggleGroup";
import { ChartContainer } from "../charts/ChartContainer";
import {
  asLocaleEuro,
  CHART_GRID_STROKE,
  DEFAULT_LINE_PROPS,
  getAxisProps,
  getTimeAxisProps,
  TOOLTIP_STYLE,
} from "../charts/chartUtils";
import {
  parseNonNegativeInt,
  parseNonNegativeNumber,
  WithdrawalChartDataSets,
  WithdrawalPlannerParameters,
  useWithdrawalPlannerData,
} from "./WithdrawalPlanner.logic";
import { styles, headlineVariants } from "./WithdrawalPlanner.styles";

const DEFAULT_PARAMETERS: WithdrawalPlannerParameters = {
  scenario: "portfolio",
  accumulationYears: 10,
  accumulationMonths: 0,
  decumulationYears: 20,
  decumulationMonths: 0,
  monthlyContribution: null,
  monthlyWithdrawal: 2000,
};

const WithdrawalPlanner = ({
  portfolioNames,
}: {
  portfolioNames: string[];
}) => {
  const [params, setParams] =
    useState<WithdrawalPlannerParameters>(DEFAULT_PARAMETERS);
  const { data, isLoading, isError } = useWithdrawalPlannerData(
    portfolioNames,
    params
  );

  const updateParam = <K extends keyof WithdrawalPlannerParameters>(
    key: K,
    value: WithdrawalPlannerParameters[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const ruinProbability = data?.ruinProbability;
  const chartData = data?.chartData ?? [];
  const ruinPercent =
    ruinProbability !== undefined
      ? Math.round(ruinProbability * 100)
      : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionBody}>
          <Heading level="section">Withdrawal Planner</Heading>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <span className={styles.label}>Scenario</span>
              <ToggleGroup>
                <ToggleItem
                  value="market"
                  selected={params.scenario === "market"}
                  onSelect={() => updateParam("scenario", "market")}
                >
                  Market
                </ToggleItem>
                <ToggleItem
                  value="portfolio"
                  selected={params.scenario === "portfolio"}
                  onSelect={() => updateParam("scenario", "portfolio")}
                >
                  Portfolio
                </ToggleItem>
              </ToggleGroup>
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Accumulation Years"
                type="number"
                min={0}
                value={params.accumulationYears}
                onChange={(e) =>
                  updateParam(
                    "accumulationYears",
                    parseNonNegativeInt(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Accumulation Months"
                type="number"
                min={0}
                max={11}
                value={params.accumulationMonths}
                onChange={(e) =>
                  updateParam(
                    "accumulationMonths",
                    parseNonNegativeInt(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Monthly Contribution"
                type="number"
                min={0}
                step={50}
                value={
                  params.monthlyContribution ?? data?.monthlyContribution ?? ""
                }
                onChange={(e) =>
                  updateParam(
                    "monthlyContribution",
                    e.target.value === ""
                      ? null
                      : parseNonNegativeNumber(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Decumulation Duration Years"
                type="number"
                min={0}
                value={params.decumulationYears}
                onChange={(e) =>
                  updateParam(
                    "decumulationYears",
                    parseNonNegativeInt(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Decumulation Duration Months"
                type="number"
                min={0}
                max={11}
                value={params.decumulationMonths}
                onChange={(e) =>
                  updateParam(
                    "decumulationMonths",
                    parseNonNegativeInt(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>

            <div className={styles.controlGroup}>
              <Input
                label="Monthly Withdrawal"
                type="number"
                min={0}
                step={100}
                value={params.monthlyWithdrawal}
                onChange={(e) =>
                  updateParam(
                    "monthlyWithdrawal",
                    parseNonNegativeNumber(e.target.value)
                  )
                }
                className="w-[14ch]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionBody}>
          {isError ? (
            <p className={styles.headlineMuted}>Error loading forecast.</p>
          ) : ruinPercent === undefined ? (
            <p className={styles.headlineMuted}>
              {isLoading
                ? "Calculating..."
                : "Portfolio historical data insufficient for analysis."}
            </p>
          ) : (
            <>
              <p
                className={headlineVariants({
                  tone: ruinPercent >= 50 ? "danger" : "safe",
                })}
              >
                {ruinPercent}% chance your plan runs out of money
              </p>
              <p className={styles.headlineMuted}>
                Based on {params.scenario === "market" ? "market" : "portfolio"}{" "}
                return assumptions.
              </p>
            </>
          )}

          <div className={styles.warning}>
            <AlertTriangle className={styles.warningIcon} />
            <span>
              This forecast assumes the same allocation throughout. If you plan
              to de-risk at retirement, ruin risk may be higher than shown.
            </span>
          </div>

          <ChartContainer isLoading={isLoading}>
            <ComposedChart data={chartData} margin={{ bottom: 30 }}>
              <Legend verticalAlign="bottom" />
              <XAxis {...getTimeAxisProps(chartData)} />
              <YAxis
                {...getAxisProps(chartData)}
                tickFormatter={(value) => (value / 1000).toString()}
                unit={" k€"}
              />
              <CartesianGrid stroke={CHART_GRID_STROKE} />

              <Area
                {...DEFAULT_LINE_PROPS}
                dataKey="uncertaintyBand"
                type="monotone"
                stroke="none"
                fill="var(--color-success-soft)"
                connectNulls
                name="90% Confidence Interval"
              />

              <Line
                {...DEFAULT_LINE_PROPS}
                dataKey={"cashFlow" satisfies WithdrawalChartDataSets}
                name={"Net Cash Flow"}
                stroke="var(--color-accent-hover)"
                strokeDasharray="8 4"
                strokeWidth={2}
              />

              <Line
                {...DEFAULT_LINE_PROPS}
                dataKey={"median" satisfies WithdrawalChartDataSets}
                name={"Market Value (Median)"}
                stroke="var(--color-success)"
                strokeDasharray="8 4"
                strokeWidth={2}
                type={"linear"}
              />

              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) =>
                  isArray(value)
                    ? [
                        `${asLocaleEuro(value[0], 0)} - ${asLocaleEuro(value[1], 0)}`,
                        name,
                      ]
                    : [asLocaleEuro(Number(value), 0), name]
                }
                labelFormatter={(value) =>
                  moment(new Date(Number(value))).format("ddd DD.MM.YYYY")
                }
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPlanner;
